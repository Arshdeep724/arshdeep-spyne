import { Module } from '@nestjs/common';
import { PostController } from '../post.controller';
import { PostService } from '../post.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      { name: 'POST_SERVICE', transport: Transport.REDIS },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
