import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getUsers, updateUserRole, assignCustomRole, createUser, updateUser, deleteUser } from './api';
import type { CreateUserInput, UpdateUserInput } from './api';
import { ApiError } from '@/lib/http';
import type { Role } from '@/types';

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: getUsers });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rôle mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useAssignCustomRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string | null }) => assignCustomRole(id, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rôle mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur créé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la création'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la suppression'),
  });
}
