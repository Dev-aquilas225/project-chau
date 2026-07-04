import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataProvider, customDataProvider } from './index';

const PRODUCTS = [
  { id: '1', name: 'Sac', price: '10.00', stock: 5, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '2', name: 'Chaussures', price: '20.00', stock: 0, createdAt: '2026-01-03T00:00:00.000Z' },
  { id: '3', name: 'Montre', price: '15.00', stock: 2, createdAt: '2026-01-02T00:00:00.000Z' },
];

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  localStorage.clear();
});

describe('dataProvider.getList', () => {
  it('paginates and sorts a bare array client-side', async () => {
    mockFetchOnce(PRODUCTS);

    const result = await dataProvider.getList('products', {
      pagination: { page: 1, perPage: 2 },
      sort: { field: 'createdAt', order: 'ASC' },
      filter: {},
    });

    expect(result.total).toBe(3);
    expect(result.data.map((d) => d.id)).toEqual(['1', '3']);
  });

  it('applies client-side substring filters not in serverFilterKeys', async () => {
    mockFetchOnce(PRODUCTS);

    const result = await dataProvider.getList('products', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: { name: 'chau' },
    });

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('2');
  });

  it('passes server filter keys as query params for sellers/orders', async () => {
    mockFetchOnce([]);

    await dataProvider.getList('sellers', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'createdAt', order: 'DESC' },
      filter: { status: 'pending' },
    });

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/sellers');
    expect(calledUrl).toContain('status=pending');
  });
});

describe('dataProvider.delete', () => {
  it('rejects delete for resources without supportsDelete', async () => {
    await expect(
      dataProvider.delete('sellers', { id: '1', previousData: { id: '1' } }),
    ).rejects.toThrow(/pas prise en charge/);
  });
});

describe('customDataProvider', () => {
  it('updateSellerStatus calls the status endpoint', async () => {
    mockFetchOnce({ id: 'u1', sellerStatus: 'approved' });

    await customDataProvider.updateSellerStatus('u1', 'approved', 'ok');

    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/sellers/u1/status');
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ status: 'approved', note: 'ok' });
  });
});
