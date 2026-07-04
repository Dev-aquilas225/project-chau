import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authProvider } from './index';

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

describe('authProvider.login', () => {
  it('stores the token and resolves for an admin user', async () => {
    mockFetchOnce({ accessToken: 'tok123', user: { id: '1', email: 'a@a.com', displayName: 'Admin', role: 'admin' } });

    await expect(authProvider.login({ username: 'a@a.com', password: 'secret' })).resolves.toBeUndefined();
    expect(localStorage.getItem('auth_token')).toBe('tok123');
  });

  it('rejects and does not store the token for a non-admin user', async () => {
    mockFetchOnce({ accessToken: 'tok123', user: { id: '1', email: 'a@a.com', displayName: 'Client', role: 'customer' } });

    await expect(authProvider.login({ username: 'a@a.com', password: 'secret' })).rejects.toThrow();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

describe('authProvider.checkAuth', () => {
  it('rejects when no token is stored', async () => {
    await expect(authProvider.checkAuth({})).rejects.toThrow();
  });

  it('resolves when a token is stored', async () => {
    localStorage.setItem('auth_token', 'tok123');
    await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
  });
});

describe('authProvider.checkError', () => {
  it('clears the token and rejects on 401/403', async () => {
    localStorage.setItem('auth_token', 'tok123');
    await expect(authProvider.checkError({ status: 401 })).rejects.toThrow();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('resolves for non-auth errors', async () => {
    await expect(authProvider.checkError({ status: 500 })).resolves.toBeUndefined();
  });
});
