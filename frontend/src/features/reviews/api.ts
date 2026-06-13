import { apiFetch } from '@/lib/http';
import type { ProductReviews } from '@/types';

export async function getProductReviews(productId: string): Promise<ProductReviews> {
  return apiFetch<ProductReviews>(`/products/${productId}/reviews`);
}

export interface NewReview {
  rating: number;
  comment?: string;
}

export async function createReview(productId: string, input: NewReview): Promise<void> {
  await apiFetch(`/products/${productId}/reviews`, { method: 'POST', body: input });
}
