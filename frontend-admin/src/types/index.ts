export type Role = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  condition?: string;
  size?: string;
  location?: string;
  active: boolean;
  weLove?: boolean;
  createdAt?: Date;
}

export interface Category { id: string; name: string; slug: string; }

export interface OrderItem {
  productId: string; name: string; brand: string; image: string; unitPrice: number; qty: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: OrderStatus;
  shippingAddress?: { fullName: string; line1: string; city: string; zip: string; country: string };
  paymentMethod: string;
  createdAt?: Date;
}

export interface Promo {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  minAmount?: number;
  usageLimit?: number;
  usedCount?: number;
}
