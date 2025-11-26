import { Request } from 'express';

export interface JwtRequest extends Request {
  user: {
    sub: string;
    // email: string;
    name: string;
    role: string;
  };
}
