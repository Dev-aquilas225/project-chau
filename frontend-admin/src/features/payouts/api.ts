import { apiFetch } from '@/lib/http';
import type { PayoutRequest } from '@/types';

export function getPayouts(): Promise<PayoutRequest[]> {
  return apiFetch<PayoutRequest[]>('/payouts');
}

export function reviewPayout(
  id: string,
  status: 'paid' | 'rejected',
  reviewNote?: string,
): Promise<PayoutRequest> {
  return apiFetch<PayoutRequest>(`/payouts/${id}`, {
    method: 'PATCH',
    body: { status, reviewNote },
  });
}
