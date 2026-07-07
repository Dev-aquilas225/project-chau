const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ORIGIN = API_URL.replace(/\/api\/?$/, '');

/** Résout une URL de fichier renvoyée par l'API (relative, ex. `/uploads/avatars/x.jpg`) en URL absolue. */
export function resolveImageUrl(url: string): string {
  return url.startsWith('http') ? url : `${ORIGIN}${url}`;
}
