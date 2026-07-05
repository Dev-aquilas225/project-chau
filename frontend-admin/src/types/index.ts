export type Role = 'customer' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type IdType = 'national_id' | 'passport';

export interface SellerProfile {
  storeName?: string;
  bio?: string;
  iban?: string;
  idType?: IdType;
  idNumber?: string;
  idCountry?: string;
  fullNameOnId?: string;
  dateOfBirth?: string;
  idDocumentRef?: string;
  idDocumentBackRef?: string;
  profilePhotoRef?: string;
  submittedAt?: string;
  verifiedAt?: string;
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
  role: Role;
  sellerStatus: SellerStatus;
  sellerProfile?: SellerProfile;
  addresses: Record<string, unknown>[];
  photoURL?: string;
  bio?: string;
  country?: string;
  city?: string;
  createdAt: string;
}

/** Vue admin d'un vendeur (retournée par GET /sellers) — sous-ensemble sanitizé de UserProfile. */
export interface SellerAdminView {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  sellerStatus: SellerStatus;
  identityVerified: boolean;
  createdAt: string;
  sellerProfile: SellerProfile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: { id: string; name: string; slug: string } | null;
}

export type ListingStatus = 'draft' | 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: Category | null;
  categoryId: string | null;
  sellerId: string | null;
  listingStatus: ListingStatus;
  images: string[];
  stock: number;
  condition?: string;
  size?: string;
  location?: string;
  active: boolean;
  weLove: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type PayoutStatus = 'pending' | 'processing' | 'paid';

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
  sellerId: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  platformFee: number;
  sellerPayout: number;
  payoutStatus: PayoutStatus;
  promoCode: string | null;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: OrderStatusHistoryEntry[];
}

export type DiscountType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minAmount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  totalOrders: number;
  outOfStockProducts: number;
  recentOrders: Order[];
  pendingSellerCount: number;
}

export interface PlatformConfigMap {
  commissionRate: number;
  sellerRegistrationEnabled: boolean;
}
