import {
  collection, doc, getDocs, updateDoc, orderBy, query, where, serverTimestamp, Timestamp,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/types';

const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore: (o) => ({ ...o }),
  fromFirestore: (snap) => {
    const d = snap.data();
    return {
      id: snap.id, userId: d.userId, items: d.items ?? [], subtotal: d.subtotal ?? 0,
      discount: d.discount ?? 0, total: d.total ?? 0, promoCode: d.promoCode, status: d.status ?? 'pending',
      shippingAddress: d.shippingAddress, paymentMethod: d.paymentMethod ?? '',
      createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : undefined,
    };
  },
};

const ordersCol = collection(db, 'orders').withConverter(orderConverter);

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const q = status
    ? query(ordersCol, where('status', '==', status), orderBy('createdAt', 'desc'))
    : query(ordersCol, orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => d.data());
}

/** Met à jour le statut. La rule n'autorise cette écriture qu'aux admins. */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  return updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
}
