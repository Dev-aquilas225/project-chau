/**
 * Favoris : purement locaux (Zustand + localStorage) depuis la migration vers le backend NestJS.
 * TODO : si un module `favorites` est ajouté au backend, réintroduire ici la synchronisation
 * serveur (write-through au login + fusion local/distant).
 */
export function useFavoritesSync() {
  // no-op : favoris gérés localement par useFavoritesStore (persisté).
}
