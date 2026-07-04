import { apiFetch } from '@/lib/http';
import type { AppNotification } from '@/types';

export async function getMyNotifications(): Promise<AppNotification[]> {
  return apiFetch<AppNotification[]>('/notifications/mine');
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/notifications/unread-count');
}

export async function markAsRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllAsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'PATCH' });
}
