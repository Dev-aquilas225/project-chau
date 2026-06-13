import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, getOrder, createOrder, type NewOrder } from './api';

export const useMyOrders = (userId?: string) =>
  useQuery({
    queryKey: ['orders', userId],
    queryFn: () => getMyOrders(),
    enabled: !!userId,
  });

export const useOrder = (id?: string) =>
  useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  });

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOrder) => createOrder(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
