import { API_URL } from './http';

const ORIGIN = API_URL.replace(/\/api\/?$/, '');

/** Résout une URL de fichier renvoyée par l'API (relative, ex. `/uploads/avatars/x.jpg`) en URL absolue. */
export function resolveImageUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
