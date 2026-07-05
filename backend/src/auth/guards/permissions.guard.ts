import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { REQUIRE_PERMISSION_KEY, type RequiredPermission } from '../decorators/require-permission.decorator';
import { hasPermission } from '../permissions.util';
import type { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(REQUIRE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Non authentifié');

    if (!hasPermission(user, required.resource, required.level)) {
      throw new ForbiddenException(`Permission requise sur "${required.resource}": ${required.level}`);
    }
    return true;
  }
}
