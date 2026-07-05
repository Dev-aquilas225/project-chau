import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getOrders, getOrder, updateOrderStatus } from './api';
import { ApiError } from '@/lib/http';
import type { OrderStatus } from '@/types';

export function useOrders(status?: OrderStatus) {
  return useQuery({ queryKey: ['orders', { status }], queryFn: () => getOrders(status) });
}

export function useOrder(id: string | undefined) {
  return useQuery({ queryKey: ['orders', id], queryFn: () => getOrder(id as string), enabled: !!id });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Statut mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}
