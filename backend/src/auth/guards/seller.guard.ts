import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class SellerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (req.user?.sellerStatus !== 'approved') {
      throw new ForbiddenException('Compte vendeur approuvé requis');
    }
    if (req.user?.blocked) {
      throw new ForbiddenException('Compte vendeur bloqué');
    }
    return true;
  }
}
