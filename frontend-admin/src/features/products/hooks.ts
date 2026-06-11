import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProducts, createProduct, updateProduct, deleteProduct, listCategories, type ProductInput,
} from './api';

export const useAdminProducts = () => useQuery({ queryKey: ['admin-products'], queryFn: listProducts });
export const useAdminCategories = () => useQuery({ queryKey: ['admin-categories'], queryFn: listCategories, staleTime: 600_000 });

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (i: ProductInput) => createProduct(i), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) });
}
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) => updateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteProduct(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }) });
}
