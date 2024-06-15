import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CreateUserDto, LogoutUserDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
  ) {}

  async login(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
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
    return this.prisma.$transaction(async (tx) => {
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
      const createdUser = await tx.user.create({
        data: {
          ...createUserDto,
        },
      });
      this.postClient.emit('user_created_event', createdUser);
      return createdUser;
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
          name: user.name,
          last_login: user.last_login,
          mobile_number: user.mobile_number,
        };
      } else throw new UnauthorizedException('Incorrect Password');
    });
  }

  async logout(logoutUserDto: LogoutUserDto) {
    await this.cacheManager.set(logoutUserDto.access_token, true, 3600000);
    await this.cacheManager.set(logoutUserDto.refresh_token, true, 604800000);
  }
}
