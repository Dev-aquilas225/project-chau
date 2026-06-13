import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, ApiError, getToken, setToken } from './http';

describe('http client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('stores and retrieves the auth token', () => {
    expect(getToken()).toBeNull();
    setToken('abc123');
    expect(getToken()).toBe('abc123');
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('attaches Authorization header when a token is present', async () => {
    setToken('my-token');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiFetch('/auth/me');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer my-token');
  });

  it('builds query strings, skipping empty values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ([]),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiFetch('/products', { query: { category: 'shoes', search: '', minPrice: undefined } });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('category=shoes');
    expect(url).not.toContain('search=');
    expect(url).not.toContain('minPrice');
  });

  it('throws ApiError with status and message on non-2xx response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Identifiants invalides' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(apiFetch('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 401,
      message: 'Identifiants invalides',
    });

    await expect(apiFetch('/auth/login', { method: 'POST', body: {} })).rejects.toBeInstanceOf(ApiError);
  });
});
