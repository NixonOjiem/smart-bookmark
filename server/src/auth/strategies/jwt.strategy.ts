import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// 1. Define JWT Token data looks like
interface JwtPayload {
  sub: string;
  name: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // This attaches to req.user
  validate(payload: JwtPayload) {
    console.log('JWT Payload:', payload);
    return {
      userId: payload.sub,
      name: payload.name,
      role: payload.role,
    };
  }
}
