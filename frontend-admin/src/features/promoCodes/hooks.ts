import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, type PromoCodeInput } from './api';
import { ApiError } from '@/lib/http';

export function usePromoCodes() {
  return useQuery({ queryKey: ['promoCodes'], queryFn: getPromoCodes });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PromoCodeInput) => createPromoCode(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Code promo créé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la création'),
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PromoCodeInput> }) => updatePromoCode(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Code promo mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Code promo supprimé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la suppression'),
  });
}
