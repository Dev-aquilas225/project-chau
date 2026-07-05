import { apiFetch, apiUpload } from '@/lib/http';
import type { Product } from '@/types';

export function getAdminProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/admin/all');
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export interface ProductInput {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  categoryId?: string;
  images?: string[];
  stock: number;
  condition?: string;
  size?: string;
  location?: string;
  active?: boolean;
  weLove?: boolean;
}

export function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<Product>('/products', { method: 'POST', body: input });
}

export function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: input });
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
}

export function uploadProductImage(file: File): Promise<{ url: string }> {
  return apiUpload<{ url: string }>('/uploads/product-image', file);
}
