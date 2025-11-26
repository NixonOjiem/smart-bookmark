import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //  Get the roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If the route has no @Roles decorator, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user object attached to the request (by JwtAuthGuard)
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role: string } }>();

    // Check if the user has the required role
    return requiredRoles.some((role) => user.role === role);
  }
}
