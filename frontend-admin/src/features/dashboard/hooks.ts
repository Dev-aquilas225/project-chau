import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getAnalytics } from './api';
import type { AnalyticsPeriod } from '@/types';

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard', 'stats'], queryFn: getDashboardStats, staleTime: 30_000 });
}

export function useAnalytics(period: AnalyticsPeriod) {
  return useQuery({ queryKey: ['dashboard', 'analytics', period], queryFn: () => getAnalytics(period), staleTime: 60_000 });
}
