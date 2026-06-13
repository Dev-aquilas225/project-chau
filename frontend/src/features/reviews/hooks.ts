import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductReviews, createReview, type NewReview } from './api';

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId),
    enabled: !!productId,
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewReview) => createReview(productId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', productId] }),
  });
}
