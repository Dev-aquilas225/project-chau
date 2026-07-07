import { apiFetch, apiUpload } from '@/lib/http';
import type { UserProfile } from '@/types';

export interface UpdateMyProfileInput {
  displayName?: string;
  photoURL?: string;
  bio?: string;
  country?: string;
  city?: string;
}

export interface ChangeMyPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function updateMyProfile(input: UpdateMyProfileInput): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: input });
}

export function changeMyPassword(input: ChangeMyPasswordInput): Promise<{ updated: boolean }> {
  return apiFetch<{ updated: boolean }>('/users/me/password', { method: 'PATCH', body: input });
}

export function uploadAvatar(file: File): Promise<{ url: string }> {
  return apiUpload<{ url: string }>('/uploads/avatar', file);
}
