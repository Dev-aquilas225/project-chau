import { apiFetch } from '@/lib/http';
import type { Role, UserProfile } from '@/types';

export function getUsers(): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>('/users');
}

export function updateUserRole(id: string, role: Role): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}/role`, { method: 'PATCH', body: { role } });
}
