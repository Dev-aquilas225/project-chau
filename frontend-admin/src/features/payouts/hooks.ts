import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPayouts, reviewPayout } from './api';
import { ApiError } from '@/lib/http';

export function usePayouts() {
  return useQuery({
    queryKey: ['payouts'],
    queryFn: getPayouts,
  });
}

export function useReviewPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: string;
      status: 'paid' | 'rejected';
      reviewNote?: string;
    }) => reviewPayout(id, status, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Demande de retrait mise à jour');
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Erreur lors du traitement');
    },
  });
}
