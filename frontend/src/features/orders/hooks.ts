import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, createOrder, type NewOrder } from './api';

export const useMyOrders = (userId?: string) =>
  useQuery({
    queryKey: ['orders', userId],
    queryFn: () => getMyOrders(userId!),
    enabled: !!userId,
  });

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOrder) => createOrder(input),
    onSuccess: (_id, vars) => qc.invalidateQueries({ queryKey: ['orders', vars.userId] }),
  });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
