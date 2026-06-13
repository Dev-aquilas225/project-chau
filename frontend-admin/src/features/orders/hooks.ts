import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listOrders, getOrder, updateOrderStatus } from './api';
import type { OrderStatus } from '@/types';

export const useAdminOrders = (status?: OrderStatus) =>
  useQuery({ queryKey: ['admin-orders', status ?? 'all'], queryFn: () => listOrders(status) });

export const useAdminOrder = (id?: string) =>
  useQuery({
    queryKey: ['admin-orders', 'detail', id],
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  });

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) => updateOrderStatus(id, status, note),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-orders', 'detail', vars.id] });
    },
  });
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
