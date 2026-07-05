import type { JwtPayload } from './strategies/jwt.strategy';
import type { PermissionLevel, ResourceKey } from '../roles/entities/role.entity';

export const PERMISSION_LEVEL_RANK: Record<PermissionLevel, number> = { none: 0, view: 1, manage: 2 };

/** true si l'utilisateur est admin (bypass total) ou dispose d'un rôle personnalisé couvrant ce niveau sur cette ressource. */
export function hasPermission(user: JwtPayload, resource: ResourceKey, level: PermissionLevel): boolean {
  if (user.role === 'admin') return true;
  const granted = user.customRole?.permissions?.[resource] ?? 'none';
  return PERMISSION_LEVEL_RANK[granted] >= PERMISSION_LEVEL_RANK[level];
}
