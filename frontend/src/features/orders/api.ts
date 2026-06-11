import {
  addDoc, collection, getDocs, orderBy, query, where, serverTimestamp, Timestamp,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Promo } from '@/types';

const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore: (o) => ({ ...o }),
  fromFirestore: (snap) => {
    const d = snap.data();
    return {
      id: snap.id,
      userId: d.userId,
      items: d.items ?? [],
      subtotal: d.subtotal ?? 0,
      discount: d.discount ?? 0,
      total: d.total ?? 0,
      promoCode: d.promoCode,
      status: d.status ?? 'pending',
      shippingAddress: d.shippingAddress,
      paymentMethod: d.paymentMethod ?? '',
      createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : undefined,
    };
  },
};

const ordersCol = collection(db, 'orders').withConverter(orderConverter);

export interface NewOrder {
  userId: string;
  items: Order['items'];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
}

/** Crée la commande. La rule impose userId == auth.uid et status == 'pending'. */
export async function createOrder(input: NewOrder) {
  const ref = await addDoc(ordersCol, {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
  } as never);
  return ref.id;
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => d.data());
}

/** Valide un code promo : lit promos où code == X et active == true. */
export async function validatePromo(code: string, subtotal: number): Promise<Promo> {
  const q = query(collection(db, 'promos'), where('code', '==', code.toUpperCase()), where('active', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Code promo invalide');
  const d = snap.docs[0];
  const promo = { id: d.id, ...d.data() } as Promo;
  if (promo.minAmount && subtotal < promo.minAmount) {
    throw new Error(`Minimum d'achat de ${promo.minAmount} $ pour ce code`);
  }
  return promo;
}

export function computeDiscount(promo: Promo, subtotal: number): number {
  const raw = promo.type === 'percentage' ? (subtotal * promo.value) / 100 : promo.value;
  return Math.min(raw, subtotal);
}
