import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Promo } from '@/types';

export async function listPromos(): Promise<Promo[]> {
  const snap = await getDocs(collection(db, 'promos'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Promo, 'id'>) }));
}

export type PromoInput = Omit<Promo, 'id' | 'usedCount'>;

/** Le code sert d'ID de document (unique). */
export async function upsertPromo(input: PromoInput) {
  const code = input.code.toUpperCase();
  return setDoc(doc(db, 'promos', code), { ...input, code, usedCount: 0, createdAt: serverTimestamp() }, { merge: true });
}

export async function deletePromo(id: string) {
  return deleteDoc(doc(db, 'promos', id));
}
