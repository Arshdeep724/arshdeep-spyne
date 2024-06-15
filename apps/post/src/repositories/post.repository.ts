import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import {
  UserCreatedEvent,
  UserDeletedEvent,
  UserUpdatedEvent,
} from '@app/shared/events';
import { CreatePostDto } from '@app/shared/dtos';
import { UpdatePostDto } from '@app/shared/dtos/update-post.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: UserCreatedEvent) {
    await this.prisma.user.create({
      data: data,
    });
  }

  async updateUser(data: UserUpdatedEvent) {
    await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: data,
    });
  }

  async deleteUser(data: UserDeletedEvent) {
    await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: data,
    });
  }

  async createPost(createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        text: createPostDto.text,
        image: createPostDto.image,
        hash_tags: createPostDto.hash_tags,
        created_by: {
          connect: {
            id: createPostDto.user_id,
          },
        },
      },
    });
  }

  async updatePost(updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: {
        id: updatePostDto.id,
      },
      data: updatePostDto,
    });
  }

  async deletePost(postId: number) {
    return this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async searchByTags(tags: string[], user_id: string) {
    return this.prisma.$transaction(async (tx) => {
      const posts = await tx.post.findMany({
        where: {
          hash_tags: {
            hasSome: tags,
          },
        },
      });
      for (const post of posts) {
        await tx.post.update({
          where: {
            id: post.id,
          },
          data: {
            Views: {
              create: {
                user_id: user_id,
              },
            },
          },
        });
      }
      return posts;
    });
  }

  async searchByText(text: string, user_id: string) {
    return this.prisma.$transaction(async (tx) => {
      const posts: any[] =
        await tx.$queryRaw`SELECT * FROM "Post" WHERE LOWER("text") LIKE ${'%' + text.toLowerCase() + '%'}`;
      for (const post of posts) {
        await tx.post.update({
          where: {
            id: post.id,
          },
          data: {
            Views: {
              create: {
                user_id: user_id,
              },
            },
          },
        });
      }
      return posts;
    });
  }

  async commentOnPost(postId: number, user_id: string, text: string) {
    return this.prisma.comments.create({
      data: {
        post_id: postId,
        user_id: user_id,
        text: text,
      },
    });
  }

  async likeOnPost(postId: number, user_id: string) {
    return this.prisma.likes.create({
      data: {
        post_id: postId,
        user_id: user_id,
      },
    });
  }

  async likeOnComment(comment_id: number, user_id: string) {
    return this.prisma.commentLikes.create({
      data: {
        comment_id: comment_id,
        user_id: user_id,
      },
    });
  }

  async replyOnComment(comment_id: number, user_id: string, text: string) {
    return this.prisma.commentReplies.create({
      data: {
        comment_id: comment_id,
        user_id: user_id,
        text: text,
      },
    });
  }

  async updateComment(comment_id: number, text: string) {
    return this.prisma.comments.update({
      where: {
        id: comment_id,
      },
      data: {
        text: text,
      },
    });
  }

  async deleteComment(comment_id: number) {
    return this.prisma.comments.delete({
      where: {
        id: comment_id,
      },
    });
  }

  async getViews(post_id: number) {
    return this.prisma.views.count({
      where: {
        post_id: post_id,
      },
    });
  }
}
