import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  applyAsSeller, getMySellerProfile, updateMySellerProfile,
  getMyListings, createListing, updateListing, deleteListing,
  getSellerOrders,
  type ApplySellerInput, type SellerProductInput,
} from './api';

export const useMySellerProfile = () =>
  useQuery({ queryKey: ['seller-profile'], queryFn: getMySellerProfile });

export function useApplyAsSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplySellerInput) => applyAsSeller(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller-profile'] }),
  });
}

export function useUpdateSellerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ApplySellerInput & { iban: string }>) => updateMySellerProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller-profile'] }),
  });
}

export const useMyListings = () =>
  useQuery({ queryKey: ['my-listings'], queryFn: getMyListings });

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SellerProductInput) => createListing(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SellerProductInput> }) => updateListing(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export const useSellerOrders = () =>
  useQuery({ queryKey: ['seller-orders'], queryFn: getSellerOrders });
