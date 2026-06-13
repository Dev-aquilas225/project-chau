import { apiFetch } from '@/lib/http';
import type { Order, PromoValidationResult } from '@/types';

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

export async function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

/** Valide un code promo côté serveur et renvoie la remise calculée (source de vérité backend). */
export async function validatePromo(code: string, subtotal: number): Promise<PromoValidationResult> {
  return apiFetch<PromoValidationResult>('/promo-codes/validate', { method: 'POST', body: { code, subtotal } });
}
