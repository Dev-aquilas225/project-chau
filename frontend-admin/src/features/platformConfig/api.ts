import { apiFetch } from '@/lib/http';
import type { PlatformConfigMap } from '@/types';

export function getPlatformConfig(): Promise<PlatformConfigMap> {
  return apiFetch<PlatformConfigMap>('/platform/config');
}

export function updatePlatformConfig(input: Partial<PlatformConfigMap>): Promise<PlatformConfigMap> {
  return apiFetch<PlatformConfigMap>('/platform/config', { method: 'PATCH', body: input });
}
