import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, apiFetchBlob, ApiError, getToken, setToken } from './http';

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

  describe('apiFetchBlob', () => {
    it('attaches Authorization header and returns a Blob', async () => {
      setToken('my-token');
      const blob = new Blob(['fake-image-bytes']);
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, blob: async () => blob });
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await apiFetchBlob('/uploads/identity/user-1-id-document-123.jpg');

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer my-token');
      expect(result).toBe(blob);
    });

    it('throws ApiError on non-2xx response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });
      global.fetch = fetchMock as unknown as typeof fetch;

      await expect(apiFetchBlob('/uploads/identity/missing.jpg')).rejects.toBeInstanceOf(ApiError);
      await expect(apiFetchBlob('/uploads/identity/missing.jpg')).rejects.toMatchObject({ status: 404 });
    });
  });
});
