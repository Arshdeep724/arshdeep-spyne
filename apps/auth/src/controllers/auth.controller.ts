import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, LogoutUserDto } from '../dto';
import { AuthRepository } from '../repositories/auth.repository';
import { LocalAuthGuard, RefreshTokenAuthGuard } from '../passport/guards';
import { Public } from '../decorators';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authRepository: AuthRepository,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
  ) {}

  @Public()
  @Get('test')
  async test() {
    return this.postClient.send({ cmd: 'get_posts' }, {});
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    return this.authRepository.login(req.user);
  }

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authRepository.createUser(createUserDto);
  }

  @Public()
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    return this.authRepository.refreshToken(req.user);
  }

  @Delete('logout')
  async logout(@Body() logoutUserDto: LogoutUserDto) {
    return this.authRepository.logout(logoutUserDto);
  }
}
