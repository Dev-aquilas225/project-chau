export type Role = 'customer' | 'admin';

export interface Address {
  fullName: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  addresses: Address[];
  createdAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
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

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  unitPrice: number;
  qty: number;
  size?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  unitPrice: number;
  qty: number;
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
  shippingAddress: Address;
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

export interface PromoValidationResult {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number;
  total: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviews {
  items: Review[];
  average: number;
  count: number;
}
