import { apiFetch } from '@/lib/http';

export async function getMyFavorites(): Promise<string[]> {
  return apiFetch<string[]>('/favorites');
}

export async function addFavorite(productId: string): Promise<void> {
  await apiFetch('/favorites', { method: 'POST', body: { productId } });
}

export async function removeFavorite(productId: string): Promise<void> {
  await apiFetch(`/favorites/${productId}`, { method: 'DELETE' });
}
