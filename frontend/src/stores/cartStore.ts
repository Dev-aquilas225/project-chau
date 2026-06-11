import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalQty: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) =>
        set((s) => {
          const found = s.items.find((i) => i.productId === product.id);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.productId === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i,
              ),
            };
          }
          const item: CartItem = {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            image: product.images[0] ?? '',
            unitPrice: product.price,
            qty,
            size: product.size,
          };
          return { items: [...s.items, item] };
        }),
      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      updateQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
      totalQty: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    }),
    { name: 'aquilas-cart' },
  ),
);
