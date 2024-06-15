import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto';
import { UserRepository } from '../repositories';

@Controller('user')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Post('update-user-details')
  async updateUserDetails(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.userRepository.updateUserDetails(req.user.id, updateUserDto);
  }

  @Post('follow')
  async followUser(@Req() req, @Query('userId') userId: string) {
    return this.userRepository.followUser(req.user.id, userId);
  }

  @Get('search')
  async searchUsers(@Query('name') name: string) {
    return this.userRepository.searchUser(name);
  }

  @Get()
  async getUserDetails() {
    return this.userRepository.getAllUsers();
  }

  @Delete()
  async deleteUser(@Req() req) {
    return this.userRepository.deleteUser(req.user.id);
  }
}
