import { NestFactory } from '@nestjs/core';
import { AuthModule } from './app/auth.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3000);
  const logger = new Logger('Auth');
  logger.log('HTTP server is listening on port 3000');
}
bootstrap();
