import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { productConverter, categoryConverter } from './converters';
import type { Product } from '@/types';

const productsCol = collection(db, 'products').withConverter(productConverter);
const categoriesCol = collection(db, 'categories').withConverter(categoryConverter);

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'recent' | 'price-asc' | 'price-desc';
}

/**
 * Récupère les produits actifs (index active+createdAt) puis applique
 * catégorie / prix / recherche / tri côté client (Firestore n'a pas de full-text).
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const q = query(productsCol, where('active', '==', true), orderBy('createdAt', 'desc'));
  let items = (await getDocs(q)).docs.map((d) => d.data());

  if (filters.category) items = items.filter((p) => p.category === filters.category);
  if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(s));
  }
  if (filters.sort === 'price-asc') items.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price-desc') items.sort((a, b) => b.price - a.price);

  return items;
}

export async function getProduct(id: string): Promise<Product> {
  const snap = await getDoc(doc(db, 'products', id).withConverter(productConverter));
  if (!snap.exists()) throw new Error('Produit introuvable');
  return snap.data();
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, 'products', id).withConverter(productConverter))));
  return snaps.filter((s) => s.exists()).map((s) => s.data());
}

export async function getCategories() {
  return (await getDocs(categoriesCol)).docs.map((d) => d.data());
}
