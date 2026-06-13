import { apiFetch } from '@/lib/http';
import type { Order, OrderStatus } from '@/types';

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  return apiFetch<Order[]>('/orders', { query: status ? { status } : undefined });
}

export async function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

/** Met à jour le statut (+ note optionnelle). Réservé aux admins (RolesGuard côté backend). */
export async function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  return apiFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status, note } });
}
