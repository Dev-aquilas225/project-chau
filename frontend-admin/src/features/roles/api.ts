import { apiFetch } from '@/lib/http';
import type { CustomRole, PermissionAction, ResourceKey } from '@/types';

export interface RoleInput {
  name: string;
  description?: string;
  permissions: Partial<Record<ResourceKey, PermissionAction[]>>;
}

export function getRoles(): Promise<CustomRole[]> {
  return apiFetch<CustomRole[]>('/roles');
}

export function createRole(input: RoleInput): Promise<CustomRole> {
  return apiFetch<CustomRole>('/roles', { method: 'POST', body: input });
}

export function updateRole(id: string, input: Partial<RoleInput>): Promise<CustomRole> {
  return apiFetch<CustomRole>(`/roles/${id}`, { method: 'PATCH', body: input });
}

export function deleteRole(id: string): Promise<void> {
  return apiFetch<void>(`/roles/${id}`, { method: 'DELETE' });
}
