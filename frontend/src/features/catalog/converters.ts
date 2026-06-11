import { type FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import type { Product, Category } from '@/types';

export const productConverter: FirestoreDataConverter<Product> = {
  toFirestore: (p) => ({ ...p }),
  fromFirestore: (snap) => {
    const d = snap.data();
    return {
      id: snap.id,
      name: d.name ?? '',
      brand: d.brand ?? '',
      description: d.description ?? '',
      price: d.price ?? 0,
      category: d.category ?? '',
      images: d.images ?? [],
      stock: d.stock ?? 0,
      condition: d.condition,
      size: d.size,
      location: d.location,
      active: d.active ?? true,
      weLove: d.weLove ?? false,
      createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : undefined,
    };
  },
};

export const categoryConverter: FirestoreDataConverter<Category> = {
  toFirestore: (c) => ({ ...c }),
  fromFirestore: (snap) => {
    const d = snap.data();
    return { id: snap.id, name: d.name ?? '', slug: d.slug ?? snap.id, parentId: d.parentId };
  },
};
