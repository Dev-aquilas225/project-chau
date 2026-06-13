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

  it('throws ApiError with status and message on non-2xx response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ message: 'Accès refusé' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(apiFetch('/users')).rejects.toMatchObject({ status: 403, message: 'Accès refusé' });
    await expect(apiFetch('/users')).rejects.toBeInstanceOf(ApiError);
  });
});
