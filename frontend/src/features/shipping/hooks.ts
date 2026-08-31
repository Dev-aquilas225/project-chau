import { useQuery } from '@tanstack/react-query';
import { calculateShippingFee, getShippingZoneForCountry } from './api';

/**
 * Charge la zone de livraison pour un code pays et le coût calculé.
 * Retourne null si aucune zone trouvée (pays sans couverture).
 */
export function useShippingZone(countryCode: string, orderTotal: number) {
  return useQuery({
    queryKey: ['shipping-zone', countryCode],
    queryFn: async () => {
      if (!countryCode || countryCode.length !== 2) return null;
      const zone = await getShippingZoneForCountry(countryCode);
      if (!zone) return null;
      return {
        zone,
        fee: calculateShippingFee(zone, orderTotal),
        isFree: zone.freeThreshold !== null && orderTotal >= zone.freeThreshold,
      };
    },
    enabled: countryCode.length === 2,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
