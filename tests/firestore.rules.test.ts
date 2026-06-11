import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, getDocs } from 'firebase/firestore';

/**
 * Lancer avec l'émulateur Firestore :
 *   firebase emulators:exec --only firestore "npm --prefix tests test"
 */
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-aquilas',
    firestore: { rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8') },
  });
});

afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  // Pré-positionner les rôles via le bypass des rules
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin'), { email: 'a@x.com', role: 'admin' });
    await setDoc(doc(db, 'users/alice'), { email: 'al@x.com', role: 'customer' });
    await setDoc(doc(db, 'products/p1'), { name: 'T', brand: 'B', price: 10, stock: 3, active: true });
    await setDoc(doc(db, 'orders/o-bob'), { userId: 'bob', total: 10, status: 'pending', items: [] });
  });
});

const asAlice = () => env.authenticatedContext('alice').firestore();
const asAdmin = () => env.authenticatedContext('admin').firestore();
const asAnon = () => env.unauthenticatedContext().firestore();

describe('products', () => {
  it('lecture publique autorisée', () => assertSucceeds(getDoc(doc(asAnon(), 'products/p1'))));
  it('écriture refusée à un client', () =>
    assertFails(addDoc(collection(asAlice(), 'products'), { name: 'X', brand: 'B', price: 5, stock: 1, active: true })));
  it('écriture autorisée à un admin', () =>
    assertSucceeds(addDoc(collection(asAdmin(), 'products'), { name: 'X', brand: 'B', price: 5, stock: 1, active: true })));
  it('écriture admin avec prix négatif refusée', () =>
    assertFails(addDoc(collection(asAdmin(), 'products'), { name: 'X', brand: 'B', price: -1, stock: 1, active: true })));
});

describe('carts / favorites (privés)', () => {
  it('un client gère son panier', () =>
    assertSucceeds(setDoc(doc(asAlice(), 'carts/alice'), { items: [] })));
  it("un client ne lit pas le panier d'un autre", () =>
    assertFails(getDoc(doc(asAlice(), 'carts/bob'))));
});

describe('orders', () => {
  it('un client crée SA commande en pending', () =>
    assertSucceeds(addDoc(collection(asAlice(), 'orders'), { userId: 'alice', total: 20, status: 'pending', items: [] })));
  it('un client NE PEUT PAS créer une commande déjà payée', () =>
    assertFails(addDoc(collection(asAlice(), 'orders'), { userId: 'alice', total: 20, status: 'paid', items: [] })));
  it("un client ne lit pas la commande d'un autre (IDOR)", () =>
    assertFails(getDoc(doc(asAlice(), 'orders/o-bob'))));
  it('un client ne change pas le statut (admin only)', () =>
    assertFails(updateDoc(doc(asAlice(), 'orders/o-bob'), { status: 'delivered' })));
  it('un admin change le statut', () =>
    assertSucceeds(updateDoc(doc(asAdmin(), 'orders/o-bob'), { status: 'shipped' })));
  it('lister toutes les commandes est refusé à un client', () =>
    assertFails(getDocs(collection(asAlice(), 'orders'))));
});

describe('escalade de rôle', () => {
  it("un client NE PEUT PAS s'auto-promouvoir admin", () =>
    assertFails(updateDoc(doc(asAlice(), 'users/alice'), { role: 'admin' })));
  it('un client met à jour son nom sans toucher au rôle', () =>
    assertSucceeds(updateDoc(doc(asAlice(), 'users/alice'), { displayName: 'Alice' })));
});

describe('promos', () => {
  it('lecture autorisée à un utilisateur connecté', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), 'promos/WELCOME10'), { code: 'WELCOME10', active: true }));
    await assertSucceeds(getDoc(doc(asAlice(), 'promos/WELCOME10')));
  });
  it('écriture refusée à un client', () =>
    assertFails(setDoc(doc(asAlice(), 'promos/HACK'), { code: 'HACK', type: 'percentage', value: 99, active: true })));
  it('écriture autorisée à un admin', () =>
    assertSucceeds(setDoc(doc(asAdmin(), 'promos/SOLDES'), { code: 'SOLDES', type: 'percentage', value: 20, active: true })));
});
