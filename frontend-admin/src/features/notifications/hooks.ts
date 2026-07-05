import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from './api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Notification } from '@/types';

export function useNotifications() {
  const { isStaff } = useAuth();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['notifications', 'mine'],
    queryFn: getMyNotifications,
    enabled: isStaff,
  });

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    enabled: isStaff,
  });

  useEffect(() => {
    if (!isStaff) return;
    const socket = getSocket();
    if (!socket) return;

    const onNotification = (notification: Notification) => {
      toast.message(notification.title, { description: notification.message });
      queryClient.setQueryData<Notification[]>(['notifications', 'mine'], (prev) =>
        prev ? [notification, ...prev].slice(0, 30) : [notification],
      );
      queryClient.setQueryData<{ count: number }>(['notifications', 'unread-count'], (prev) => ({
        count: (prev?.count ?? 0) + 1,
      }));
    };

    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [isStaff, queryClient]);

  return { notifications: listQuery.data ?? [], unreadCount: unreadQuery.data?.count ?? 0, isLoading: listQuery.isLoading };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
