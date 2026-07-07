import { SetMetadata } from '@nestjs/common';
import type { PermissionAction, ResourceKey } from '../../roles/entities/role.entity';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

export interface RequiredPermission {
  resource: ResourceKey;
  action: PermissionAction;
}

export const RequirePermission = (resource: ResourceKey, action: PermissionAction) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { resource, action } as RequiredPermission);
