import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import type { Role, SellerStatus } from '../../users/entities/user.entity';
import type { PermissionAction, ResourceKey } from '../../roles/entities/role.entity';
import { requireJwtSecret } from '../jwt-secret';
import { CLIENT_APP_HEADER, resolveAudience, type JwtAudience } from '../jwt-audience';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sellerStatus: SellerStatus;
  blocked: boolean;
  customRole: { id: string; permissions: Partial<Record<ResourceKey, PermissionAction[]>> } | null;
  aud: JwtAudience;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    config: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(config),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    // Le token doit avoir été émis pour l'app qui l'utilise : un token client ne doit
    // pas fonctionner sur l'admin (et inversement), même s'il est copié manuellement.
    const declaredApp = resolveAudience(req.headers[CLIENT_APP_HEADER] as string | undefined);
    if (payload.aud !== declaredApp) {
      this.logger.warn(
        `token rejeté (audience mismatch) email=${payload.email} tokenAud=${payload.aud} appelantAud=${declaredApp} route=${req.method} ${req.originalUrl}`,
      );
      throw new UnauthorizedException();
    }

    const user = await this.usersRepo.findOne({ where: { id: payload.sub }, relations: ['customRole'] });
    if (!user) throw new UnauthorizedException();
    if (user.blocked) throw new UnauthorizedException('Compte bloqué');
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      sellerStatus: user.sellerStatus,
      blocked: user.blocked,
      customRole: user.customRole ? { id: user.customRole.id, permissions: user.customRole.permissions } : null,
      aud: payload.aud,
    };
  }
}
