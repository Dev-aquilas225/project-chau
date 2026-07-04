import { ResourceConfig } from './types';

export const resourceConfigs: Record<string, ResourceConfig> = {
  sellers: {
    listPath: '/sellers',
    entityPath: (id) => `/sellers/${id}`,
    serverFilterKeys: ['status'],
  },
  products: {
    listPath: '/products/admin/all',
    entityPath: (id) => `/products/${id}`,
    supportsCreate: true,
    supportsDelete: true,
  },
  orders: {
    listPath: '/orders',
    entityPath: (id) => `/orders/${id}`,
    serverFilterKeys: ['status'],
  },
  users: {
    listPath: '/users',
    entityPath: (id) => `/users/${id}`,
  },
  promotions: {
    listPath: '/promo-codes',
    entityPath: (id) => `/promo-codes/${id}`,
    supportsCreate: true,
    supportsDelete: true,
  },
};

export function getResourceConfig(resource: string): ResourceConfig {
  const config = resourceConfigs[resource];
  if (!config) {
    throw new Error(`Aucune configuration de ressource pour "${resource}".`);
  }
  return config;
}
