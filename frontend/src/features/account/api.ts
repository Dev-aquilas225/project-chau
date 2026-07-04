import { apiFetch, getToken } from '@/lib/http';
import type { UserProfile } from '@/types';

export async function updateProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: input });
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${base}/uploads/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Échec upload');
  return res.json() as Promise<{ url: string }>;
}
