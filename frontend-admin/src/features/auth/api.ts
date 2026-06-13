import { apiFetch, setToken } from '@/lib/http';
import type { UserProfile } from '@/types';

interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export async function adminLogin(email: string, password: string): Promise<UserProfile> {
  const res = await apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
  if (res.user.role !== 'admin') {
    setToken(null);
    throw new Error('Accès réservé aux administrateurs.');
  }
  setToken(res.accessToken);
  return res.user;
}

export async function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me');
}

export function adminLogout(): Promise<void> {
  setToken(null);
  return Promise.resolve();
}
