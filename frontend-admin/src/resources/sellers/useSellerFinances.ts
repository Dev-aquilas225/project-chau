import { useMemo } from 'react';
import { useGetList } from 'react-admin';
import type { Order } from '../../types';

export interface SellerFinances {
  revenue: number;
  payout: number;
}

/**
 * No per-seller revenue/payout endpoint exists on the backend — orders are
 * fetched once (already a full-array fetch given the backend has no server
 * pagination) and aggregated client-side into a sellerId -> {revenue, payout} map.
 */
export function useSellerFinances() {
  const { data, isPending } = useGetList<Order>('orders', {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: 'createdAt', order: 'DESC' },
    filter: {},
  });

  const bySeller = useMemo(() => {
    const map = new Map<string, SellerFinances>();
    for (const order of data ?? []) {
      if (!order.sellerId) continue;
      const current = map.get(order.sellerId) ?? { revenue: 0, payout: 0 };
      current.revenue += Number(order.total) || 0;
      current.payout += Number(order.sellerPayout) || 0;
      map.set(order.sellerId, current);
    }
    return map;
  }, [data]);

  return { bySeller, isPending };
}
