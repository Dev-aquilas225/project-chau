import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from './api';

export const useNotifications = (userId?: string) =>
  useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getMyNotifications(),
    enabled: !!userId,
  });

export const useUnreadCount = (userId?: string) =>
  useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => getUnreadCount(),
    enabled: !!userId,
    refetchInterval: 30000,
  });

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
