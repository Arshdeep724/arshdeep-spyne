import { Module } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PrismaService } from '../db/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PostController } from '../controllers/post.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [PostController],
  providers: [PostRepository, PrismaService],
})
export class PostModule {}
