import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCategories, createCategory, updateCategory, deleteCategory, type CategoryInput } from './api';
import { ApiError } from '@/lib/http';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 5 * 60_000 });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie créée');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la création'),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) => updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie mise à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie supprimée');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la suppression'),
  });
}
