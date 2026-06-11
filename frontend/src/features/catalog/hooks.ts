import { useQuery } from '@tanstack/react-query';
import { getProducts, getProduct, getCategories, getProductsByIds, type ProductFilters } from './api';

export const useProducts = (filters: ProductFilters) =>
  useQuery({ queryKey: ['products', filters], queryFn: () => getProducts(filters) });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id), enabled: !!id });

export const useProductsByIds = (ids: string[]) =>
  useQuery({ queryKey: ['products-by-ids', ids], queryFn: () => getProductsByIds(ids) });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 10 * 60_000 });
