import { apiFetch } from '@/lib/http';
import type { UserProfile, SellerStatus } from '@/types';

export async function listSellers(status?: SellerStatus): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>('/sellers', { query: status ? { status } : {} });
}

export async function updateSellerStatus(
  userId: string,
  status: Extract<SellerStatus, 'approved' | 'rejected'>,
  note?: string,
): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/sellers/${userId}/status`, { method: 'PATCH', body: { status, note } });
}
