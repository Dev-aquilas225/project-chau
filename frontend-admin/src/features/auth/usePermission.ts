import { useAuth } from './AuthProvider';
import type { PermissionAction, ResourceKey } from '@/types';

export function usePermission(resource: ResourceKey): PermissionAction[] {
  const { role, customRole } = useAuth();
  if (role === 'admin') return ['view_any', 'view', 'create', 'update', 'delete'];
  return customRole?.permissions?.[resource] ?? [];
}

export function useHasPermission(resource: ResourceKey, action: PermissionAction): boolean {
  return usePermission(resource).includes(action);
}

export function useHasAnyPermission(resource: ResourceKey, actions: PermissionAction[]): boolean {
  const granted = usePermission(resource);
  return actions.some((action) => granted.includes(action));
}
