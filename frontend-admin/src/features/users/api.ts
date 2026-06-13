import { apiFetch } from '@/lib/http';
import type { Role, UserProfile } from '@/types';

export async function listUsers(): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>('/users');
}

/** Change le rôle d'un utilisateur. Réservé aux admins (RolesGuard côté backend). */
export async function setUserRole(uid: string, role: Role): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${uid}/role`, { method: 'PATCH', body: { role } });
}
