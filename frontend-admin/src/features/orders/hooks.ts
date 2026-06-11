import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listOrders, updateOrderStatus } from './api';
import type { OrderStatus } from '@/types';

export const useAdminOrders = (status?: OrderStatus) =>
  useQuery({ queryKey: ['admin-orders', status ?? 'all'], queryFn: () => listOrders(status) });

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
