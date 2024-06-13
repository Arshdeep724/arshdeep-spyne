import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from 'src/auth/repositories/auth.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,"jwt") {
  constructor(
    private authRepository: AuthRepository,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true
    });
  }

  async validate(request: Request, payload:any) {
    const token = request.headers['authorization'].replace("Bearer","").trim();
    const isBlackListed = await this.cacheManager.get(token);
    if(isBlackListed === true) {
      throw new UnauthorizedException("Token Invalid");
    }
    return  {
        id: payload.id,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name
    }
  }
}
