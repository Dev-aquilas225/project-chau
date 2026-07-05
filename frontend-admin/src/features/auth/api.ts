import { apiFetch, setToken } from '@/lib/http';
import type { UserProfile } from '@/types';

interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const res = await apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
  setToken(res.accessToken);
  return res.user;
}

export function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me');
}

export function logout(): void {
  setToken(null);
}
