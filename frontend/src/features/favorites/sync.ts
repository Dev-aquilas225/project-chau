import { useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFavoritesStore } from '@/stores/favoritesStore';

/**
 * Synchronise les favoris locaux (Zustand) avec Firestore favorites/{uid} :
 * - à la connexion : fusionne le local et le distant
 * - à chaque changement : écrit dans Firestore (write-through)
 * Anonyme : favoris purement locaux.
 */
export function useFavoritesSync() {
  const { user } = useAuth();
  const ids = useFavoritesStore((s) => s.ids);
  const setIds = useFavoritesStore((s) => s.set);
  const merged = useRef(false);

  // Fusion initiale à la connexion
  useEffect(() => {
    merged.current = false;
    if (!user) return;
    (async () => {
      const ref = doc(db, 'favorites', user.uid);
      const snap = await getDoc(ref);
      const remote: string[] = snap.exists() ? snap.data().productIds ?? [] : [];
      const local = useFavoritesStore.getState().ids;
      const union = Array.from(new Set([...remote, ...local]));
      setIds(union);
      await setDoc(ref, { productIds: union, updatedAt: serverTimestamp() }, { merge: true });
      merged.current = true;
    })();
  }, [user, setIds]);

  // Write-through après la fusion
  useEffect(() => {
    if (!user || !merged.current) return;
    setDoc(doc(db, 'favorites', user.uid), { productIds: ids, updatedAt: serverTimestamp() }, { merge: true });
  }, [ids, user]);
}
