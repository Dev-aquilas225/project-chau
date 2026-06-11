/**
 * Seed Firestore avec des catégories, produits, un code promo et des utilisateurs de démo.
 *
 * Contre l'ÉMULATEUR (recommandé pour le dev) :
 *   set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080   (PowerShell : $env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080")
 *   set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *   node seed.mjs
 *
 * Contre la PROD : fournir GOOGLE_APPLICATION_CREDENTIALS (clé de service) puis `node seed.mjs`.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Par défaut on cible l'ÉMULATEUR local (aucune credential nécessaire).
// Mode PROD uniquement si une clé de service est fournie via GOOGLE_APPLICATION_CREDENTIALS.
const hasCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!hasCreds && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

const useEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
console.log(useEmulator ? `Cible : ÉMULATEUR (${process.env.FIRESTORE_EMULATOR_HOST})` : 'Cible : PRODUCTION');
initializeApp({
  projectId: process.env.GCLOUD_PROJECT || 'aquilas-ecommerce',
  ...(useEmulator ? {} : { credential: applicationDefault() }),
});

const db = getFirestore();
const auth = getAuth();
const now = FieldValue.serverTimestamp();

const categories = [
  { id: 'robes', name: 'Robes', slug: 'robes' },
  { id: 'tops', name: 'Tops', slug: 'tops' },
  { id: 'manteaux', name: 'Manteaux', slug: 'manteaux' },
  { id: 'sacs', name: 'Sacs', slug: 'sacs' },
  { id: 'chaussures', name: 'Chaussures', slug: 'chaussures' },
  { id: 'accessoires', name: 'Accessoires', slug: 'accessoires' },
];

const img = (seed) => `https://picsum.photos/seed/${seed}/600/800`;

const products = [
  { name: 'Mini robe', brand: 'Cecilie Bahnsen', description: 'Mini robe en taffetas, volants superposés. Pièce iconique de la maison danoise.', price: 344, category: 'robes', images: [img('cecilie1'), img('cecilie2')], stock: 2, condition: 'Très bon état', size: '2 US', location: 'États-Unis', weLove: true },
  { name: 'Top à bretelles', brand: 'Dôen', description: 'Top à bretelles en coton imprimé floral indigo.', price: 144, category: 'tops', images: [img('doen1'), img('doen2')], stock: 5, condition: 'Neuf avec étiquette', size: 'L', location: 'États-Unis', weLove: true },
  { name: 'Mini robe plissée', brand: 'Rotate', description: 'Mini robe plissée à paillettes, coupe trapèze.', price: 89, category: 'robes', images: [img('rotate1'), img('rotate2')], stock: 1, condition: 'Très bon état', size: '38 FR', location: 'France', weLove: true },
  { name: 'Manteau en laine', brand: 'Max Mara', description: 'Manteau long en laine et cachemire, ceinture à nouer.', price: 520, category: 'manteaux', images: [img('maxmara1'), img('maxmara2')], stock: 3, condition: 'Bon état', size: '40 FR', location: 'Italie', weLove: false },
  { name: 'Sac Le Pliage', brand: 'Longchamp', description: 'Sac cabas Le Pliage en toile et cuir.', price: 95, category: 'sacs', images: [img('longchamp1')], stock: 8, condition: 'Très bon état', size: 'M', location: 'France', weLove: false },
  { name: 'Escarpins en cuir', brand: 'Jimmy Choo', description: 'Escarpins pointus en cuir verni noir, talon 90mm.', price: 210, category: 'chaussures', images: [img('jimmy1'), img('jimmy2')], stock: 2, condition: 'Bon état', size: '38 EU', location: 'Royaume-Uni', weLove: true },
  { name: 'Foulard en soie', brand: 'Hermès', description: 'Carré en soie 90x90, imprimé équestre.', price: 280, category: 'accessoires', images: [img('hermes1')], stock: 0, condition: 'Neuf', size: 'Unique', location: 'France', weLove: true },
  { name: 'Blazer oversize', brand: 'The Frankie Shop', description: 'Blazer oversize épaules structurées, laine mélangée.', price: 130, category: 'manteaux', images: [img('frankie1'), img('frankie2')], stock: 4, condition: 'Très bon état', size: 'S', location: 'États-Unis', weLove: false },
];

async function run() {
  console.log(`Seeding (${useEmulator ? 'ÉMULATEUR' : 'PROD'})...`);

  const batch = db.batch();
  for (const c of categories) {
    batch.set(db.collection('categories').doc(c.id), { name: c.name, slug: c.slug });
  }
  for (const p of products) {
    batch.set(db.collection('products').doc(), { ...p, active: true, createdAt: now, updatedAt: now });
  }
  batch.set(db.collection('promos').doc('WELCOME10'), {
    code: 'WELCOME10', type: 'percentage', value: 10, active: true,
    minAmount: 50, usageLimit: 1000, usedCount: 0, createdAt: now,
  });
  batch.set(db.collection('promos').doc('LUXE50'), {
    code: 'LUXE50', type: 'fixed', value: 50, active: true,
    minAmount: 300, usageLimit: 100, usedCount: 0, createdAt: now,
  });
  await batch.commit();
  console.log(`✓ ${categories.length} catégories, ${products.length} produits, 2 codes promo`);

  // Utilisateurs de démo (Auth + doc miroir)
  await ensureUser('admin@aquilas.com', 'admin1234', 'Admin Aquilas', 'admin');
  await ensureUser('client@aquilas.com', 'client1234', 'Client Démo', 'customer');
  console.log('✓ Utilisateurs : admin@aquilas.com / client@aquilas.com (mdp : *1234)');
  console.log('Terminé.');
}

async function ensureUser(email, password, displayName, role) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({ email, password, displayName });
  }
  if (role === 'admin') await auth.setCustomUserClaims(user.uid, { admin: true });
  await db.collection('users').doc(user.uid).set({
    email, displayName, role, addresses: [], createdAt: now,
  }, { merge: true });
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
