export type Role = 'customer' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface SellerProfile {
  storeName?: string;
  bio?: string;
  iban?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

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
  bio?: string;
  country?: string;
  city?: string;
  role: Role;
  sellerStatus: SellerStatus;
  sellerProfile: SellerProfile;
  identityVerified?: boolean;
  addresses: Address[];
  walletBalance?: number;
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
  sellerId?: string | null;
  listingStatus?: string;
  seller?: Pick<UserProfile, 'id' | 'displayName' | 'sellerProfile' | 'createdAt'> | null;
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
  promoCode?: string;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  buyerConfirmed?: boolean;
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

export type NotificationType = 'order_status' | 'seller_status';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}
