import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateUserDto, LogoutUserDto, UpdateUserDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MailService } from 'src/utils';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService
  ) {}

  async login(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    return {
      ...payload,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshToken(user: any) {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (user) {
        Logger.log(`User with Email ${createUserDto.email} Already exists`);
        return;
      }
      const saltRounds = 10;
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
      await tx.user.create({
        data: {
          ...createUserDto,
        },
      });
    });
  }

  async validateUser(email: string, password: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new UnauthorizedException(
          'Email Id Not Found. Enter Correct Email or Create New Account',
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (user && isPasswordValid) {
        await this.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            last_login: new Date(),
          },
        });
        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          last_login: user.last_login,
          mobile_number: user.mobile_number,
        };
      } else throw new UnauthorizedException('Incorrect Password');
    });
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      throw new BadRequestException('Old Password Does Not Match');
    }
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async forgotPassword(email: string) {
    const reset_code = uuidv4();
    const doesUserExist = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!doesUserExist) {
      throw new BadRequestException(
        'Email Id Not Found. Enter Correct Email or Create New Account',
      );
    }
    const user = await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        reset_code: reset_code,
      },
    });
    await this.mailService.sendResetCode(user.email,user.reset_code);
  }

  async resetPassword(userId: string, reset_code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        reset_code: true,
      },
    });
    if (!user.reset_code) {
      throw new BadRequestException('You have already Reset your Password');
    }
    if (user.reset_code !== reset_code) {
      throw new BadRequestException('Rest Code Invalid');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        reset_code: null,
      },
    });
  }

  async getUserDetails(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        last_login: true,
        mobile_number: true,
      },
    });
  }

  async updateUserDetails(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updateUserDto,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        last_login: true,
        mobile_number: true,
      },
    });
  }

  async logout(logoutUserDto: LogoutUserDto) {
    await this.cacheManager.set(logoutUserDto.access_token, true, 3600000);
    await this.cacheManager.set(logoutUserDto.refresh_token, true, 604800000);
  }

  async test() {
    const users = await this.prisma.user.findMany();
    return users;
  }
}