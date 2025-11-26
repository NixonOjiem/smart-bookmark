import { Request } from 'express';

export interface JwtRequest extends Request {
  user: {
    userId: string;
    name: string;
    role: string;
  };
}
