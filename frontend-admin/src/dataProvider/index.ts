import type {
  CreateParams,
  DataProvider,
  DeleteManyParams,
  DeleteParams,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  GetOneParams,
  UpdateManyParams,
  UpdateParams,
} from 'react-admin';
import { apiFetch } from './httpClient';
import { getResourceConfig } from './resourceConfig';

function getValueByPath(record: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, record);
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
  return String(a).localeCompare(String(b));
}

function applyClientFilters<T extends Record<string, unknown>>(
  data: T[],
  filter: Record<string, unknown>,
  ignoredKeys: string[],
): T[] {
  const entries = Object.entries(filter).filter(([key]) => !ignoredKeys.includes(key));
  if (entries.length === 0) return data;
  return data.filter((record) =>
    entries.every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      const recordValue = getValueByPath(record, key);
      if (key === 'q') {
        const haystack = JSON.stringify(record).toLowerCase();
        return haystack.includes(String(value).toLowerCase());
      }
      if (typeof recordValue === 'string' && typeof value === 'string') {
        return recordValue.toLowerCase().includes(value.toLowerCase());
      }
      return recordValue === value;
    }),
  );
}

async function fetchList<T>(resource: string, filter: Record<string, unknown> = {}): Promise<T[]> {
  const config = getResourceConfig(resource);
  const serverFilterKeys = config.serverFilterKeys ?? [];
  const query: Record<string, string | number | boolean | undefined> = {};
  for (const key of serverFilterKeys) {
    if (filter[key] !== undefined) query[key] = filter[key] as string | number | boolean;
  }
  return apiFetch<T[]>(config.listPath, { query });
}

function entityPath(resource: string, id: string | number): string {
  const config = getResourceConfig(resource);
  return config.entityPath ? config.entityPath(id) : `${config.listPath}/${id}`;
}

export const dataProvider: DataProvider = {
  async getList(resource, params: GetListParams) {
    const { pagination, sort, filter } = params;
    const config = getResourceConfig(resource);
    const serverFilterKeys = config.serverFilterKeys ?? [];

    const all = await fetchList<Record<string, unknown>>(resource, filter);
    const filtered = applyClientFilters(all, filter ?? {}, serverFilterKeys);

    const sorted = sort?.field
      ? [...filtered].sort((a, b) => {
          const result = compareValues(getValueByPath(a, sort.field), getValueByPath(b, sort.field));
          return sort.order === 'DESC' ? -result : result;
        })
      : filtered;

    const { page, perPage } = pagination ?? { page: 1, perPage: sorted.length || 1 };
    const start = (page - 1) * perPage;
    const data = sorted.slice(start, start + perPage);

    return { data: data as never[], total: sorted.length };
  },

  async getOne(resource, params: GetOneParams) {
    const data = await apiFetch(entityPath(resource, params.id));
    return { data: data as never };
  },

  async getMany(resource, params: GetManyParams) {
    const data = await Promise.all(params.ids.map((id) => apiFetch(entityPath(resource, id))));
    return { data: data as never[] };
  },

  async getManyReference(resource, params: GetManyReferenceParams) {
    const filter = { ...(params.filter ?? {}), [params.target]: params.id };
    const { data, total } = await dataProvider.getList(resource, {
      pagination: params.pagination,
      sort: params.sort,
      filter,
    });
    return { data, total } as never;
  },

  async create(resource, params: CreateParams) {
    const config = getResourceConfig(resource);
    if (!config.supportsCreate) {
      throw new Error(`La création n'est pas prise en charge pour "${resource}".`);
    }
    const data = await apiFetch(config.listPath, { method: 'POST', body: params.data });
    return { data: data as never };
  },

  async update(resource, params: UpdateParams) {
    const data = await apiFetch(entityPath(resource, params.id), { method: 'PATCH', body: params.data });
    return { data: data as never };
  },

  async updateMany(resource, params: UpdateManyParams) {
    await Promise.all(
      params.ids.map((id) => apiFetch(entityPath(resource, id), { method: 'PATCH', body: params.data })),
    );
    return { data: params.ids };
  },

  async delete(resource, params: DeleteParams) {
    const config = getResourceConfig(resource);
    if (!config.supportsDelete) {
      throw new Error(`La suppression n'est pas prise en charge pour "${resource}".`);
    }
    await apiFetch(entityPath(resource, params.id), { method: 'DELETE' });
    return { data: (params.previousData ?? { id: params.id }) as never };
  },

  async deleteMany(resource, params: DeleteManyParams) {
    const config = getResourceConfig(resource);
    if (!config.supportsDelete) {
      throw new Error(`La suppression n'est pas prise en charge pour "${resource}".`);
    }
    await Promise.all(params.ids.map((id) => apiFetch(entityPath(resource, id), { method: 'DELETE' })));
    return { data: params.ids };
  },
};

export interface DashboardStats {
  totalRevenue: number;
  ordersByStatus: { pending: number; paid: number; shipped: number; delivered: number; cancelled: number };
  totalOrders: number;
  outOfStockProducts: number;
  pendingSellerCount: number;
  recentOrders: Record<string, unknown>[];
}

export interface PlatformConfig {
  commissionRate: number;
  sellerRegistrationEnabled: boolean;
}

export const customDataProvider = {
  updateSellerStatus: (userId: string, status: 'approved' | 'rejected', note?: string) =>
    apiFetch(`/sellers/${userId}/status`, { method: 'PATCH', body: { status, note } }),

  updateUserRole: (userId: string, role: 'customer' | 'admin') =>
    apiFetch(`/users/${userId}/role`, { method: 'PATCH', body: { role } }),

  updateOrderStatus: (
    id: string,
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
    note?: string,
  ) => apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: { status, note } }),

  getConfig: () => apiFetch<PlatformConfig>('/platform/config'),

  updateConfig: (data: Partial<PlatformConfig>) =>
    apiFetch<PlatformConfig>('/platform/config', { method: 'PATCH', body: data }),

  getDashboardStats: () => apiFetch<DashboardStats>('/admin/dashboard/stats'),
};
