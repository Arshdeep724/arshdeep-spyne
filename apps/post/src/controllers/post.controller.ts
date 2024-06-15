import {
  UserCreatedEvent,
  UserDeletedEvent,
  UserUpdatedEvent,
} from '@app/shared/events';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { PrismaService } from '../db/prisma.service';
import { PostRepository } from '../repositories/post.repository';
import { CreatePostDto, UpdatePostDto } from '@app/shared/dtos';

@Controller()
export class PostController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postRepository: PostRepository,
  ) {}

  @EventPattern('user_created_event')
  async handleUserCreatedEvent(data: UserCreatedEvent) {
    console.log('User created event received:', data);
    await this.postRepository.createUser(data);
  }

  @EventPattern('user_updated_event')
  async handleUserUpdatedEvent(data: UserUpdatedEvent) {
    console.log('User updated event received:', data);
    await this.postRepository.updateUser(data);
  }

  @EventPattern('user_deleted_event')
  async handleUserDeletedEvent(data: UserDeletedEvent) {
    console.log('User deleted event received:', data);
    await this.postRepository.deleteUser(data);
  }

  @MessagePattern({ cmd: 'create-post' })
  async createPost(data: CreatePostDto) {
    return this.postRepository.createPost(data);
  }


  @MessagePattern({ cmd: 'update-post' })
  async updatePost(data: UpdatePostDto) {
    return this.postRepository.updatePost(data);
  }

  @MessagePattern({ cmd: 'delete-post' })
  async deletePost(postId: number) {
    return this.postRepository.deletePost(postId);
  }

  @MessagePattern({ cmd: 'search-by-tags' })
  async searchByTags(data: { tags: string[]; user_id: string }) {
    return this.postRepository.searchByTags(data.tags, data.user_id);
  }

  @MessagePattern({ cmd: 'search-by-text' })
  async searchByText(data: { text: string; user_id: string }) {
    return this.postRepository.searchByText(data.text, data.user_id);
  }

  @MessagePattern({ cmd: 'comment' })
  async addComment(data: { postId: number; user_id: string; text: string }) {
    return this.postRepository.commentOnPost(
      data.postId,
      data.user_id,
      data.text,
    );
  }

  @MessagePattern({ cmd: 'like-post' })
  async likePost(data: { postId: number; user_id: string }) {
    return this.postRepository.likeOnPost(data.postId, data.user_id);
  }

  @MessagePattern({ cmd: 'like-comment' })
  async likeComment(data: { comment_id: number; user_id: string }) {
    return this.postRepository.likeOnComment(data.comment_id, data.user_id);
  }

  @MessagePattern({ cmd: 'reply-comment' })
  async replyComment(data: {
    comment_id: number;
    user_id: string;
    text: string;
  }) {
    return this.postRepository.replyOnComment(
      data.comment_id,
      data.user_id,
      data.text,
    );
  }

  @MessagePattern({ cmd: 'update-comment' })
  async updateComment(data: { comment_id: number; text: string }) {
    return this.postRepository.updateComment(data.comment_id, data.text);
  }

  @MessagePattern({ cmd: 'delete-comment' })
  async deleteComment(data: { comment_id: number}) {
    return this.postRepository.deleteComment(data.comment_id);
  }

  @MessagePattern({ cmd: 'get-views' })
  async getViews(post_id: number) {
    return this.postRepository.getViews(post_id);
  }
}
