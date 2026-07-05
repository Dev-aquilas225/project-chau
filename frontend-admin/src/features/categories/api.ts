import { apiFetch } from '@/lib/http';
import type { Category } from '@/types';

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

export interface CategoryInput {
  name: string;
  slug: string;
  parentId?: string | null;
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return apiFetch<Category>('/categories', { method: 'POST', body: input });
}

export function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: input });
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}
