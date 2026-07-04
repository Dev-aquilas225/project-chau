import type { AuthProvider } from 'react-admin';
import { apiFetch, getToken, setToken } from '../dataProvider/httpClient';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'customer' | 'admin';
  photoURL?: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authProvider: AuthProvider = {
  async login({ username, password }: { username: string; password: string }) {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email: username, password },
    });

    if (response.user.role !== 'admin') {
      throw new Error('Accès réservé aux administrateurs.');
    }

    setToken(response.accessToken);
  },

  async logout() {
    setToken(null);
  },

  async checkAuth() {
    if (!getToken()) throw new Error('Non authentifié.');
  },

  async checkError({ status }: { status?: number }) {
    if (status === 401 || status === 403) {
      setToken(null);
      throw new Error('Session expirée.');
    }
  },

  async getIdentity() {
    const user = await apiFetch<AuthUser>('/auth/me');
    return { id: user.id, fullName: user.displayName, avatar: user.photoURL };
  },

  async getPermissions() {
    if (!getToken()) return undefined;
    const user = await apiFetch<AuthUser>('/auth/me');
    return user.role;
  },
};
