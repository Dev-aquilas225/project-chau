import { apiFetch } from '@/lib/http';
import type { Product, Category } from '@/types';

export interface ProductFilters {
  category?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'recent' | 'price-asc' | 'price-desc';
}

// L'API renvoie categoryId ; on le mappe sur le champ `category` attendu par le frontend.
function mapProduct(p: Product & { categoryId?: string | null }): Product {
  return { ...p, category: p.categoryId ?? p.category ?? '' };
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const items = await apiFetch<Product[]>('/products', { query: { ...filters } });
  return items.map(mapProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const item = await apiFetch<Product>(`/products/${id}`);
  return mapProduct(item);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const items = await apiFetch<Product[]>('/products/by-ids', { query: { ids: ids.join(',') } });
  return items.map(mapProduct);
}

// L'API renvoie `parent: { id, ... } | null` ; on l'aplatit en `parentId` pour le frontend.
function mapCategory(c: Category & { parent?: { id: string } | null }): Category {
  return { ...c, parentId: c.parent?.id ?? undefined };
}

export async function getCategories(): Promise<Category[]> {
  const items = await apiFetch<Category[]>('/categories');
  return items.map(mapCategory);
}
