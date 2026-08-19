/**
 * Sépare les jetons émis pour le site client de ceux émis pour le back-office admin.
 * Chaque frontend déclare son identité via l'en-tête HTTP `X-Client-App`, qui doit
 * correspondre à la claim `aud` du JWT — sinon la requête est rejetée. Ça empêche un
 * token récupéré sur une app d'être simplement recopié pour se faire passer pour
 * l'autre app (ex: token client collé dans le localStorage de l'admin).
 *
 * Ce n'est pas la barrière d'autorisation principale (celle-ci reste le rôle relu en
 * base à chaque requête dans JwtStrategy.validate) — c'est une séparation de session
 * supplémentaire entre les deux applications.
 */
export type JwtAudience = 'client' | 'admin';

export const CLIENT_APP_HEADER = 'x-client-app';

export function resolveAudience(headerValue: string | string[] | undefined): JwtAudience {
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return value === 'admin' ? 'admin' : 'client';
}
