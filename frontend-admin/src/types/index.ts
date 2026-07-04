export type Role = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PayoutStatus = 'pending' | 'processing' | 'paid';
export type ListingStatus = 'draft' | 'active' | 'archived';
export type DiscountType = 'percentage' | 'fixed';

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
  photoURL?: string;
  createdAt?: string;
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
  price: number | string;
  categoryId: string | null;
  seller?: UserProfile | null;
  sellerId: string | null;
  listingStatus: ListingStatus;
  images: string[];
  stock: number;
  condition?: string;
  size?: string;
  location?: string;
  active: boolean;
  weLove?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  unitPrice: number;
  qty: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
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
  promoCode?: string | null;
  status: OrderStatus;
  shippingAddress?: { fullName: string; line1: string; city: string; zip: string; country: string };
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
  statusHistory?: OrderStatusHistoryEntry[];
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minAmount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt?: string;
}
