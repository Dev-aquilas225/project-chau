import { apiFetch } from '@/lib/http';
import type { Promo } from '@/types';

interface PromoCodeDto {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount: number;
  expiresAt: string | null;
  active: boolean;
}

function fromDto(dto: PromoCodeDto): Promo {
  return {
    id: dto.id,
    code: dto.code,
    type: dto.discountType,
    value: Number(dto.discountValue),
    active: dto.active,
    minAmount: Number(dto.minAmount),
  };
}

export type PromoInput = Omit<Promo, 'id' | 'usedCount'>;

function toBody(input: PromoInput) {
  return {
    code: input.code,
    discountType: input.type,
    discountValue: input.value,
    minAmount: input.minAmount ?? 0,
    active: input.active,
  };
}

export async function listPromos(): Promise<Promo[]> {
  const data = await apiFetch<PromoCodeDto[]>('/promo-codes');
  return data.map(fromDto);
}

export async function upsertPromo(input: PromoInput & { id?: string }): Promise<void> {
  if (input.id) {
    await apiFetch(`/promo-codes/${input.id}`, { method: 'PATCH', body: toBody(input) });
  } else {
    await apiFetch('/promo-codes', { method: 'POST', body: toBody(input) });
  }
}

export async function deletePromo(id: string): Promise<void> {
  await apiFetch(`/promo-codes/${id}`, { method: 'DELETE' });
}
