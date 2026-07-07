import { apiFetch } from '@/lib/http';
import type { Role, UserProfile } from '@/types';

export interface CreateUserInput {
  displayName: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  displayName?: string;
  email?: string;
}

export function getUsers(): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>('/users');
}

export function updateUserRole(id: string, role: Role): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}/role`, { method: 'PATCH', body: { role } });
}

export function assignCustomRole(id: string, roleId: string | null): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}/custom-role`, { method: 'PATCH', body: { roleId } });
}

export function createUser(input: CreateUserInput): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users', { method: 'POST', body: input });
}

export function updateUser(id: string, input: UpdateUserInput): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}`, { method: 'PATCH', body: input });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
}
