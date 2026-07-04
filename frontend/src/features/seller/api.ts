import { apiFetch, getToken } from '@/lib/http';
import type { UserProfile, Product, Order } from '@/types';

export interface ApplySellerInput {
  storeName: string;
  bio?: string;
  idType: 'national_id' | 'passport';
  idNumber: string;
  idCountry: string;
  fullNameOnId: string;
  dateOfBirth: string;
  idDocumentRef: string;
  idDocumentBackRef?: string;
  profilePhotoRef: string;
}

export interface ApplySellerResponse {
  accessToken: string;
  user: UserProfile;
}

export interface SellerProductInput {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  categoryId?: string;
  images?: string[];
  stock: number;
  condition?: string;
  size?: string;
  location?: string;
}

export async function applyAsSeller(input: ApplySellerInput): Promise<ApplySellerResponse> {
  return apiFetch<ApplySellerResponse>('/sellers/apply', { method: 'POST', body: input });
}

export async function getMySellerProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/sellers/me');
}

export async function updateMySellerProfile(input: Partial<ApplySellerInput & { iban: string }>): Promise<UserProfile> {
  return apiFetch<UserProfile>('/sellers/me', { method: 'PATCH', body: input });
}

export async function getMyListings(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/mine');
}

export async function createListing(input: SellerProductInput): Promise<Product> {
  return apiFetch<Product>('/products', { method: 'POST', body: input });
}

export async function updateListing(id: string, input: Partial<SellerProductInput>): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: input });
}

export async function deleteListing(id: string): Promise<{ archived: boolean }> {
  return apiFetch<{ archived: boolean }>(`/products/${id}`, { method: 'DELETE' });
}

export async function uploadListingImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const token = (await import('@/lib/http')).getToken();
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${base}/uploads/product-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Échec upload');
  return res.json() as Promise<{ url: string }>;
}

export async function uploadIdentityDocument(
  file: File,
  kind: 'id-document' | 'id-document-back' | 'profile-photo',
): Promise<{ ref: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${base}/uploads/identity/${kind}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Échec upload');
  return res.json() as Promise<{ ref: string }>;
}

export async function getSellerOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/seller');
}
