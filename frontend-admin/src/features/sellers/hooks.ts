import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSellers, updateSellerStatus, setSellerBlocked } from './api';
import { ApiError } from '@/lib/http';
import type { SellerStatus } from '@/types';

export function useSellers(status?: SellerStatus) {
  return useQuery({ queryKey: ['sellers', { status }], queryFn: () => getSellers(status) });
}

/** Pas de GET /sellers/:id côté backend — on récupère la liste complète et on filtre côté client. */
export function useSeller(userId: string | undefined) {
  const query = useQuery({ queryKey: ['sellers', { status: undefined }], queryFn: () => getSellers() });
  return {
    ...query,
    data: query.data?.find((s) => s.id === userId),
  };
}

export function useUpdateSellerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
      note,
    }: {
      userId: string;
      status: Extract<SellerStatus, 'approved' | 'rejected'>;
      note?: string;
    }) => updateSellerStatus(userId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Statut vendeur mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useSetSellerBlocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, blocked, reason }: { userId: string; blocked: boolean; reason?: string }) =>
      setSellerBlocked(userId, blocked, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Statut de blocage mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}
