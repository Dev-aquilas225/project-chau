import { apiFetch } from '@/lib/http';
import type { Notification } from '@/types';

export function getMyNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>('/notifications/mine');
}

export function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/notifications/unread-count');
}

export function markNotificationRead(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>('/notifications/read-all', { method: 'PATCH' });
}
