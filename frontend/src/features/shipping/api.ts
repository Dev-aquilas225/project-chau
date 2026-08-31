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
}

/** Retourne la zone applicable pour un code pays ISO 2 lettres */
export function getShippingZoneForCountry(countryCode: string): Promise<ShippingZone | null> {
  return apiFetch<ShippingZone | null>(`/shipping-zones/for-country/${countryCode}`).catch(
    () => null,
  );
}

/** Calcule le frais de livraison en tenant compte du seuil de gratuité */
export function calculateShippingFee(zone: ShippingZone, orderTotal: number): number {
  if (zone.freeThreshold !== null && orderTotal >= zone.freeThreshold) return 0;
  return Number(zone.basePrice);
}
