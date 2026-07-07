import type { JwtPayload } from './strategies/jwt.strategy';
import type { PermissionAction, ResourceKey } from '../roles/entities/role.entity';

/** true si l'utilisateur est admin (bypass total) ou si son rôle personnalisé accorde cette action sur cette ressource. */
export function hasPermission(user: JwtPayload, resource: ResourceKey, action: PermissionAction): boolean {
  if (user.role === 'admin') return true;
  const granted = user.customRole?.permissions?.[resource] ?? [];
  return granted.includes(action);
}
