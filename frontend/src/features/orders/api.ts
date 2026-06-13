import { apiFetch } from '@/lib/http';
import type { Order, Promo } from '@/types';

export interface NewOrder {
  items: Order['items'];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
}

/** Crée la commande. Le backend impose userId == utilisateur connecté et status == 'pending'. */
export async function createOrder(input: NewOrder): Promise<string> {
  const order = await apiFetch<Order>('/orders', { method: 'POST', body: input });
  return order.id;
}

export async function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/mine');
}

/**
 * TODO: module `promos` non encore migré côté backend NestJS (hors scope v1).
 * En attendant, tout code promo est refusé côté client.
 */
export async function validatePromo(_code: string, _subtotal: number): Promise<Promo> {
  throw new Error('Les codes promo ne sont pas encore disponibles.');
}

export function computeDiscount(promo: Promo, subtotal: number): number {
  const raw = promo.type === 'percentage' ? (subtotal * promo.value) / 100 : promo.value;
  return Math.min(raw, subtotal);
}
