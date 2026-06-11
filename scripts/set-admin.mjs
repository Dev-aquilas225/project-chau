/**
 * Promeut un utilisateur en admin : pose le custom claim { admin: true } ET users/{uid}.role = 'admin'.
 * Usage : node set-admin.mjs <email>
 * (mêmes variables d'env émulateur/prod que seed.mjs)
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
if (!email) { console.error('Usage: node set-admin.mjs <email>'); process.exit(1); }

const hasCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!hasCreds && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}
const useEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
initializeApp({
  projectId: process.env.GCLOUD_PROJECT || 'aquilas-ecommerce',
  ...(useEmulator ? {} : { credential: applicationDefault() }),
});

const auth = getAuth();
const db = getFirestore();

const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { admin: true });
await db.collection('users').doc(user.uid).set({ role: 'admin' }, { merge: true });
console.log(`✓ ${email} est maintenant admin (claim + users/${user.uid}.role).`);
process.exit(0);
