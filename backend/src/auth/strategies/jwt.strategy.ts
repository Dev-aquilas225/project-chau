import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type { Role, SellerStatus } from '../../users/entities/user.entity';
import type { PermissionAction, ResourceKey } from '../../roles/entities/role.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sellerStatus: SellerStatus;
  blocked: boolean;
  customRole: { id: string; permissions: Partial<Record<ResourceKey, PermissionAction[]>> } | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
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
    };
  }
}
