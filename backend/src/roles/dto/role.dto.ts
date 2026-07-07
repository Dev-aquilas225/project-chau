import { IsObject, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { PERMISSION_ACTIONS, RESOURCE_KEYS, type PermissionAction, type ResourceKey } from '../entities/role.entity';

function assertValidPermissions(value: unknown): asserts value is Partial<Record<ResourceKey, PermissionAction[]>> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('permissions doit être un objet');
  }
  for (const [key, actions] of Object.entries(value)) {
    if (!RESOURCE_KEYS.includes(key as ResourceKey)) {
      throw new Error(`Ressource inconnue: ${key}`);
    }
    if (!Array.isArray(actions) || actions.some((a) => !PERMISSION_ACTIONS.includes(a))) {
      throw new Error(`Actions de permission invalides pour ${key}`);
    }
  }
}

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  permissions: Partial<Record<ResourceKey, PermissionAction[]>>;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  permissions?: Partial<Record<ResourceKey, PermissionAction[]>>;
}

export class AssignRoleDto {
  @ValidateIf((o) => o.roleId !== null)
  @IsString()
  roleId: string | null;
}

export { assertValidPermissions };
