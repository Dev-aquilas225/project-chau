const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = options;

  let url = `${API_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const data = await res.json();
      message = data.message ?? message;
      code = data.error;
    } catch {
      // ignore parsing error
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message, code);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Upload multipart (FormData) — distinct de apiFetch qui force Content-Type: application/json. */
export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message ?? message;
    } catch {
      // ignore parsing error
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }
  return res.json() as Promise<T>;
}

/** Récupère un fichier protégé par JWT (ex. document KYC) sous forme d'URL d'objet local à révoquer après usage. */
export async function apiFetchBlobUrl(path: string): Promise<string> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
