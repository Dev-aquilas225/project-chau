import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createShippingZone,
  deleteShippingZone,
  getAllShippingZones,
  updateShippingZone,
  type CreateShippingZonePayload,
  type UpdateShippingZonePayload,
} from './api';

const QUERY_KEY = ['shipping-zones'];

export function useShippingZones() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getAllShippingZones });
}

export function useCreateShippingZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShippingZonePayload) => createShippingZone(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Zone de livraison créée');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });
}

export function useUpdateShippingZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShippingZonePayload }) =>
      updateShippingZone(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Zone mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useDeleteShippingZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShippingZone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Zone supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}
