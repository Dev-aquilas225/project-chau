import { apiFetch } from '@/lib/http';
import type { PlatformConfig } from '@/types';

export async function getPlatformConfig(): Promise<PlatformConfig> {
  return apiFetch<PlatformConfig>('/platform/config');
}

export async function updatePlatformConfig(patch: Partial<PlatformConfig>): Promise<PlatformConfig> {
  return apiFetch<PlatformConfig>('/platform/config', { method: 'PATCH', body: patch });
}
