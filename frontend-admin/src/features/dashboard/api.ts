import { apiFetch } from '@/lib/http';
import type { DashboardStats } from '@/types';

export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/admin/dashboard/stats');
}
