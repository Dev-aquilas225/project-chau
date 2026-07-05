import { apiFetch } from '@/lib/http';
import type { DiscountType, PromoCode } from '@/types';

export function getPromoCodes(): Promise<PromoCode[]> {
  return apiFetch<PromoCode[]>('/promo-codes');
}

export interface PromoCodeInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minAmount?: number;
  expiresAt?: string;
  active?: boolean;
}

export function createPromoCode(input: PromoCodeInput): Promise<PromoCode> {
  return apiFetch<PromoCode>('/promo-codes', { method: 'POST', body: input });
}

export function updatePromoCode(id: string, input: Partial<PromoCodeInput>): Promise<PromoCode> {
  return apiFetch<PromoCode>(`/promo-codes/${id}`, { method: 'PATCH', body: input });
}

export function deletePromoCode(id: string): Promise<void> {
  return apiFetch<void>(`/promo-codes/${id}`, { method: 'DELETE' });
}
