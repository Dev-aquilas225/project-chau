export type Role = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PayoutStatus = 'pending' | 'processing' | 'paid';

export interface SellerProfile {
  storeName?: string;
  bio?: string;
  iban?: string;
  idType?: 'national_id' | 'passport';
  idNumber?: string;
  idCountry?: string;
  fullNameOnId?: string;
  dateOfBirth?: string;
  idDocumentRef?: string;
  idDocumentBackRef?: string;
  profilePhotoRef?: string;
  submittedAt?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  sellerStatus?: SellerStatus;
  sellerProfile?: SellerProfile;
  identityVerified?: boolean;
  createdAt?: Date;
}

export interface PlatformConfig {
  commissionRate: number;
  sellerRegistrationEnabled: boolean;
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

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  sellerId?: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  platformFee?: number;
  sellerPayout?: number;
  payoutStatus?: PayoutStatus;
  promoCode?: string;
  status: OrderStatus;
  shippingAddress?: { fullName: string; line1: string; city: string; zip: string; country: string };
  paymentMethod: string;
  createdAt?: Date;
  statusHistory?: OrderStatusHistoryEntry[];
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
