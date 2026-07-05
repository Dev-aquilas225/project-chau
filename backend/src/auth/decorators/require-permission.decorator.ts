import { SetMetadata } from '@nestjs/common';
import type { PermissionLevel, ResourceKey } from '../../roles/entities/role.entity';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

export interface RequiredPermission {
  resource: ResourceKey;
  level: PermissionLevel;
}

export const RequirePermission = (resource: ResourceKey, level: PermissionLevel = 'manage') =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { resource, level } as RequiredPermission);
