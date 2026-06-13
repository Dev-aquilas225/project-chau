import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { getMyFavorites, addFavorite } from './api';

/**
 * Synchronise les favoris locaux (Zustand/localStorage) avec l'API quand l'utilisateur est connecté.
 * Au login : récupère les favoris serveur, fusionne avec les favoris locaux (push des favoris
 * locaux absents du serveur), puis active la synchronisation temps réel via le store.
 * Si non connecté : favoris purement locaux (fallback).
 */
export function useFavoritesSync() {
  const { user } = useAuth();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    const store = useFavoritesStore.getState();

    if (!user) {
      store.setRemoteEnabled(false);
      synced.current = null;
      return;
    }

    if (synced.current === user.id) return;
    synced.current = user.id;

    (async () => {
      try {
        const remoteIds = await getMyFavorites();
        const localIds = useFavoritesStore.getState().ids;
        const merged = Array.from(new Set([...remoteIds, ...localIds]));

        const localOnly = localIds.filter((id) => !remoteIds.includes(id));
        await Promise.all(localOnly.map((id) => addFavorite(id).catch(() => {})));

        useFavoritesStore.getState().set(merged);
        useFavoritesStore.getState().setRemoteEnabled(true);
      } catch {
        // hors-ligne ou erreur API : on garde le fallback local
      }
    })();
  }, [user]);
}
