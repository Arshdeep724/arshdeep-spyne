import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ChangePasswordDto, UpdateUserDto } from 'src/auth/dto';
import { AuthRepository } from '../repositories/auth.repository';
import { Public } from '../decorators';

@Controller('user')
export class UserController {
  constructor(private readonly authRepository: AuthRepository) {}

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.authRepository.forgotPassword(changePasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.authRepository.resetPassword(changePasswordDto.userId,changePasswordDto.reset_code,changePasswordDto.new_password);
  }

  @Post('update-password')
  async updatePassword(@Body() changePasswordDto: ChangePasswordDto,@Req() req) {
    await this.authRepository.updatePassword(req.user.id,changePasswordDto.old_password,changePasswordDto.new_password);
  }

  @Post('update-user-details')
  async updateUserDetails(@Body() updateUserDto:UpdateUserDto,@Req() req) {
    return this.authRepository.updateUserDetails(req.user.id,updateUserDto);
  }

  @Get()
  async getUserDetails(@Req() req) {
    return this.authRepository.getUserDetails(req.user.id);
  }
}