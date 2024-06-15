import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../db/prisma.service';
import { AuthRepository, UserRepository } from '../repositories';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  JwtStrategy,
  LocalStrategy,
  RefreshTokenStrategy,
} from '../passport/strategies';
import { UserController, AuthController } from '../controllers';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../passport/guards';
import { PostController } from '../controllers/post.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'POST_SERVICE',
        transport: Transport.REDIS,
        options: { host: 'localhost', port: 6379 },
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    CacheModule.register({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UserController, PostController],
  providers: [
    AuthRepository,
    UserRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
