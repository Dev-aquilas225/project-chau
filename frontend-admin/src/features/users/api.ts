import { apiFetch } from '@/lib/http';
import type { Role, UserProfile } from '@/types';

export function getUsers(): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>('/users');
}

export function updateUserRole(id: string, role: Role): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}/role`, { method: 'PATCH', body: { role } });
}

export function assignCustomRole(id: string, roleId: string | null): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}/custom-role`, { method: 'PATCH', body: { roleId } });
}
