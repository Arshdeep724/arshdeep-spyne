import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { UpdateUserDto } from '../dto';
import { AuthRepository } from '../repositories/auth.repository';

@Controller('user')
export class UserController {
  constructor(private readonly authRepository: AuthRepository) {}

  @Post('update-user-details')
  async updateUserDetails(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.authRepository.updateUserDetails(req.user.id, updateUserDto);
  }

  @Get()
  async getUserDetails(@Req() req) {
    return this.authRepository.getUserDetails(req.user.id);
  }

  @Delete()
  async deleteUser(@Req() req) {
    return this.authRepository.getUserDetails(req.user.id);
  }
}
