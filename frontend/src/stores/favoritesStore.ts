import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addFavorite, removeFavorite } from '@/features/favorites/api';

interface FavoritesState {
  ids: string[];
  /** true si un utilisateur est connecté : les changements sont aussi synchronisés vers l'API. */
  remoteEnabled: boolean;
  setRemoteEnabled: (enabled: boolean) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  set: (ids: string[]) => void;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      remoteEnabled: false,
      setRemoteEnabled: (enabled) => set({ remoteEnabled: enabled }),
      toggle: (id) => {
        const isFav = get().ids.includes(id);
        set((s) => ({ ids: isFav ? s.ids.filter((x) => x !== id) : [...s.ids, id] }));
        if (get().remoteEnabled) {
          const action = isFav ? removeFavorite(id) : addFavorite(id);
          action.catch(() => {
            // rollback en cas d'échec serveur
            set((s) => ({ ids: isFav ? [...s.ids, id] : s.ids.filter((x) => x !== id) }));
          });
        }
      },
      has: (id) => get().ids.includes(id),
      set: (ids) => set({ ids }),
      clear: () => set({ ids: [] }),
    }),
    { name: 'aquilas-favorites', partialize: (s) => ({ ids: s.ids }) as unknown as FavoritesState },
  ),
);
