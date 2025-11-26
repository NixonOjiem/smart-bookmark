import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// 1. Define JWT Token data looks like
interface JwtPayload {
  sub: string;
  // email: string;
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
    return {
      userId: payload.sub,
      //email: payload.email,
      name: payload.name, // <--- Available in req.user.name
      role: payload.role, // <--- Available in req.user.role
    };
  }
}
