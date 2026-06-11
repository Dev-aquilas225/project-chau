import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

/** Crée le document miroir users/{uid} si absent. Rôle TOUJOURS 'customer' (la rule l'impose). */
export async function ensureUserDoc(user: User, displayName?: string) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: displayName || user.displayName || user.email?.split('@')[0] || 'Utilisateur',
      photoURL: user.photoURL ?? null,
      role: 'customer',
      addresses: [],
      createdAt: serverTimestamp(),
    });
  }
  return ref;
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await ensureUserDoc(cred.user, displayName);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(cred.user);
  return cred.user;
}

export function logout() {
  return fbSignOut(auth);
}
