import { apiFetch } from '@/lib/http';
import type { Order, OrderStatus } from '@/types';

export function getOrders(status?: OrderStatus): Promise<Order[]> {
  return apiFetch<Order[]>('/orders', { query: { status } });
}

export function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

export function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status, note } });
}
