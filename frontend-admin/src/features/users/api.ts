import { collection, doc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role, UserProfile } from '@/types';

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      role: (data.role ?? 'customer') as Role,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    };
  });
}

/**
 * Change le rôle d'un utilisateur. La rule autorise cette écriture aux admins.
 * ⚠️ Le custom claim { admin } doit aussi être posé via le script Admin SDK
 * pour les protections basées sur les claims (set-admin.mjs).
 */
export async function setUserRole(uid: string, role: Role) {
  return updateDoc(doc(db, 'users', uid), { role });
}
