import { apiFetch } from '@/lib/http';

export interface ShippingZone {
  id: string;
  name: string;
  carrier: string;
  countryCodes: string[];
  basePrice: number;
  freeThreshold: number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingZonePayload {
  name: string;
  carrier: string;
  countryCodes: string[];
  basePrice: number;
  freeThreshold?: number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  sortOrder?: number;
  active?: boolean;
}

export type UpdateShippingZonePayload = Partial<CreateShippingZonePayload>;

/** Admin — toutes les zones */
export function getAllShippingZones(): Promise<ShippingZone[]> {
  return apiFetch<ShippingZone[]>('/shipping-zones/all');
}

/** Public — zones actives */
export function getActiveShippingZones(): Promise<ShippingZone[]> {
  return apiFetch<ShippingZone[]>('/shipping-zones');
}

/** Public — zone pour un pays donné */
export function getShippingZoneForCountry(countryCode: string): Promise<ShippingZone | null> {
  return apiFetch<ShippingZone | null>(`/shipping-zones/for-country/${countryCode}`);
}

export function createShippingZone(payload: CreateShippingZonePayload): Promise<ShippingZone> {
  return apiFetch<ShippingZone>('/shipping-zones', { method: 'POST', body: payload });
}

export function updateShippingZone(id: string, payload: UpdateShippingZonePayload): Promise<ShippingZone> {
  return apiFetch<ShippingZone>(`/shipping-zones/${id}`, { method: 'PATCH', body: payload });
}

export function deleteShippingZone(id: string): Promise<void> {
  return apiFetch<void>(`/shipping-zones/${id}`, { method: 'DELETE' });
}
