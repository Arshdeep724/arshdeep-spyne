import { Controller, Get } from '@nestjs/common';
import { PostService } from './post.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @MessagePattern({cmd: 'get_posts'})
  getHello(): string {
    return "Taflap";
    return this.postService.getHello();
  }
}
