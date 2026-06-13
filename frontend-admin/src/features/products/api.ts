import { apiFetch, getToken } from '@/lib/http';
import type { Product, Category } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function mapProduct(p: Product & { categoryId?: string | null }): Product {
  return { ...p, category: p.categoryId ?? p.category ?? '' };
}

export async function listProducts(): Promise<Product[]> {
  const items = await apiFetch<Product[]>('/products/admin/all');
  return items.map(mapProduct);
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

export async function createProduct(input: ProductInput) {
  const { category, ...rest } = input;
  return apiFetch<Product>('/products', { method: 'POST', body: { ...rest, categoryId: category || undefined } });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { category, ...rest } = input;
  const body: Record<string, unknown> = { ...rest };
  if (category !== undefined) body.categoryId = category || undefined;
  return apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body });
}

export async function deleteProduct(id: string) {
  return apiFetch<{ deleted: boolean }>(`/products/${id}`, { method: 'DELETE' });
}

/** Upload d'une image produit (réservé aux admins, voir UploadsController). */
export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const token = getToken();
  const res = await fetch(`${API_URL}/uploads/product-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) throw new Error("Échec de l'upload de l'image");
  const data = await res.json();
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}${data.url}`;
}

export async function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}
