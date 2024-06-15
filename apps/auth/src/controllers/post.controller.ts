import { CreatePostDto, UpdatePostDto } from '@app/shared/dtos';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('post')
export class PostController {
  constructor(
    @Inject('POST_SERVICE') private readonly postClient: ClientProxy,
  ) {}

  @Get('tags')
  async searchByTags(@Body('tags') tags: string[], @Req() req) {
    return this.postClient.send(
      { cmd: 'search-by-tags' },
      { tags, user_id: req.user.id },
    );
  }

  @Get('text')
  async searchByText(@Body('text') text: string, @Req() req) {
    return this.postClient.send(
      { cmd: 'search-by-text' },
      { text, user_id: req.user.id },
    );
  }

  @Post('update')
  async updatePost(@Body() body: UpdatePostDto) {
    return this.postClient.send({ cmd: 'update-post' }, body);
  }

  @Post('comment')
  async addComment(@Query() queries, @Req() req) {
    return this.postClient.send(
      { cmd: 'comment' },
      { postId: +queries.postId, user_id: req.user.id, text: queries.text },
    );
  }

  @Post('like')
  async addLike(@Query() queries, @Req() req) {
    return this.postClient.send(
      { cmd: 'like-post' },
      { postId: +queries.postId, user_id: req.user.id },
    );
  }

  @Post('like/comment')
  async addLikeOnComment(@Query() queries, @Req() req) {
    return this.postClient.send(
      { cmd: 'like-comment' },
      { comment_id: +queries.comment_id, user_id: req.user.id },
    );
  }

  @Post('reply/comment')
  async replyComment(@Query() queries, @Req() req) {
    return this.postClient.send(
      { cmd: 'reply-comment' },
      {
        comment_id: +queries.comment_id,
        user_id: req.user.id,
        text: queries.text,
      },
    );
  }

  @Post('update/comment')
  async updateComment(@Query() queries) {
    return this.postClient.send(
      { cmd: 'update-comment' },
      {
        comment_id: +queries.comment_id,
        text: queries.text,
      },
    );
  }

  @Delete('comment')
  async deleteComment(@Query() queries) {
    return this.postClient.send(
      { cmd: 'delete-comment' },
      {
        comment_id: +queries.comment_id,
      },
    );
  }

  @Post()
  async createPost(@Body() body: CreatePostDto, @Req() req) {
    body.user_id = req.user.id;
    return this.postClient.send({ cmd: 'create-post' }, body);
  }

  @Delete()
  async deletePost(@Query('postId') postId: number) {
    return this.postClient.send({ cmd: 'delete-post' }, +postId);
  }

  @Get('views')
  async getUserDetails(@Query('postId') postId: number) {
    return this.postClient.send({ cmd: 'get-views' }, +postId);
  }
}
