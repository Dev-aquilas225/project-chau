import { apiFetch, setToken } from '@/lib/http';
import type { UserProfile } from '@/types';

interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
  const res = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, displayName },
  });
  setToken(res.accessToken);
  return res.user;
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const res = await apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
  setToken(res.accessToken);
  return res.user;
}

export async function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me');
}

export function logout(): Promise<void> {
  setToken(null);
  return Promise.resolve();
}
