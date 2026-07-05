import { useAuth } from './AuthProvider';
import type { PermissionLevel, ResourceKey } from '@/types';

const LEVEL_RANK: Record<PermissionLevel, number> = { none: 0, view: 1, manage: 2 };

export function usePermission(resource: ResourceKey): PermissionLevel {
  const { role, customRole } = useAuth();
  if (role === 'admin') return 'manage';
  return customRole?.permissions?.[resource] ?? 'none';
}

export function useHasPermission(resource: ResourceKey, level: PermissionLevel): boolean {
  const granted = usePermission(resource);
  return LEVEL_RANK[granted] >= LEVEL_RANK[level];
}
