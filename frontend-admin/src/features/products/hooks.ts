import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type ProductInput,
} from './api';
import { ApiError } from '@/lib/http';

export function useAdminProducts() {
  return useQuery({ queryKey: ['products', 'admin'], queryFn: getAdminProducts });
}

export function useProduct(id: string | undefined) {
  return useQuery({ queryKey: ['products', id], queryFn: () => getProduct(id as string), enabled: !!id });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit créé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la création'),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit supprimé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la suppression'),
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => uploadProductImage(file),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'upload"),
  });
}
