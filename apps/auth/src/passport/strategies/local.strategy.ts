import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthRepository } from 'apps/auth/src/repositories/auth.repository';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authRepository:AuthRepository) {
    super();
  }

  async validate(email: string, password: string) {
    const user = await this.authRepository.validateUser(email, password);
    return user;
  }
}
