import { apiFetch } from '@/lib/http';
import type { AnalyticsData, AnalyticsPeriod, DashboardStats } from '@/types';

export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/admin/dashboard/stats');
}

export function getAnalytics(period: AnalyticsPeriod): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>('/admin/dashboard/analytics', { query: { period } });
}
