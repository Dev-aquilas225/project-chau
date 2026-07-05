import { apiFetch } from '@/lib/http';
import type { SellerAdminView, SellerStatus } from '@/types';

export function getSellers(status?: SellerStatus): Promise<SellerAdminView[]> {
  return apiFetch<SellerAdminView[]>('/sellers', { query: { status } });
}

export function updateSellerStatus(
  userId: string,
  status: Extract<SellerStatus, 'approved' | 'rejected'>,
  note?: string,
): Promise<SellerAdminView> {
  return apiFetch<SellerAdminView>(`/sellers/${userId}/status`, { method: 'PATCH', body: { status, note } });
}
