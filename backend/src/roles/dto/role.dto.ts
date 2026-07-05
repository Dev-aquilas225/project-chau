import { IsObject, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { RESOURCE_KEYS, type PermissionLevel, type ResourceKey } from '../entities/role.entity';

const LEVELS: PermissionLevel[] = ['none', 'view', 'manage'];

function assertValidPermissions(value: unknown): asserts value is Partial<Record<ResourceKey, PermissionLevel>> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('permissions doit être un objet');
  }
  for (const [key, level] of Object.entries(value)) {
    if (!RESOURCE_KEYS.includes(key as ResourceKey)) {
      throw new Error(`Ressource inconnue: ${key}`);
    }
    if (!LEVELS.includes(level as PermissionLevel)) {
      throw new Error(`Niveau de permission invalide pour ${key}: ${level}`);
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
  permissions: Partial<Record<ResourceKey, PermissionLevel>>;
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
  permissions?: Partial<Record<ResourceKey, PermissionLevel>>;
}

export class AssignRoleDto {
  @ValidateIf((o) => o.roleId !== null)
  @IsString()
  roleId: string | null;
}

export { assertValidPermissions };
