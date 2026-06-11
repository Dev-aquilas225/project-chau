import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, orderBy, query,
  serverTimestamp, Timestamp, type FirestoreDataConverter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Product, Category } from '@/types';

const productConverter: FirestoreDataConverter<Product> = {
  toFirestore: (p) => ({ ...p }),
  fromFirestore: (snap) => {
    const d = snap.data();
    return {
      id: snap.id, name: d.name ?? '', brand: d.brand ?? '', description: d.description ?? '',
      price: d.price ?? 0, category: d.category ?? '', images: d.images ?? [], stock: d.stock ?? 0,
      condition: d.condition, size: d.size, location: d.location, active: d.active ?? true, weLove: d.weLove ?? false,
      createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : undefined,
    };
  },
};

const productsCol = collection(db, 'products').withConverter(productConverter);

export async function listProducts(): Promise<Product[]> {
  const q = query(productsCol, orderBy('createdAt', 'desc'));
  return (await getDocs(q)).docs.map((d) => d.data());
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

export async function createProduct(input: ProductInput) {
  return addDoc(productsCol, { ...input, createdAt: serverTimestamp() } as never);
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  return updateDoc(doc(db, 'products', id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, 'products', id));
}

/** Upload d'une image produit dans Storage (write réservé aux admins par les rules). */
export async function uploadProductImage(file: File): Promise<string> {
  const path = `products/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const snap = await uploadBytes(ref(storage, path), file);
  return getDownloadURL(snap.ref);
}

export async function listCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map((d) => ({ id: d.id, name: d.data().name, slug: d.data().slug }));
}
