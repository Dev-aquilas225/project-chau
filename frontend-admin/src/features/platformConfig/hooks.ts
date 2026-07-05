import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPlatformConfig, updatePlatformConfig } from './api';
import { ApiError } from '@/lib/http';
import type { PlatformConfigMap } from '@/types';

export function usePlatformConfig() {
  return useQuery({ queryKey: ['platformConfig'], queryFn: getPlatformConfig });
}

export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PlatformConfigMap>) => updatePlatformConfig(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformConfig'] });
      toast.success('Paramètres mis à jour');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}
