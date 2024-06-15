import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { UpdateUserDto } from '../dto';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
  ) {}

  async getUserDetails(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        last_login: true,
        mobile_number: true,
      },
    });
  }

  async updateUserDetails(userId: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updateUserDto,
      },
      select: {
        id: true,
        email: true,
        name: true,
        last_login: true,
        mobile_number: true,
      },
    });
    this.postClient.emit('user_updated_event', updatedUser);
    return updatedUser;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async deleteUser(userId: string) {
    const deletedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: 'deleted User',
        email: uuidv4(),
        mobile_number: uuidv4(),
        password: 'password',
      },
    });
    this.postClient.emit('user_deleted_event', deletedUser);
    return deletedUser;
  }

  async searchUser(name: string) {
    const users = await this.prisma.$queryRaw`
    SELECT * FROM "User" WHERE LOWER("name") LIKE ${'%' + name.toLowerCase() + '%'}
  `;
    return users;
  }

  async followUser(followerUserId: string, followedUserId: string) {
    const existingFollowRecord = await this.prisma.followers.findUnique({
      where: {
        followed_user_follower: {
          followed_user: followerUserId,
          follower: followerUserId,
        },
      },
    });
    if (existingFollowRecord) {
      throw new BadRequestException('Already Followed');
    }
    return this.prisma.followers.create({
      data: {
        followed_user: followedUserId,
        follower: followerUserId,
      },
    });
  }
}
