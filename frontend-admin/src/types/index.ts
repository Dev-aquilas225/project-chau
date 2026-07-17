export type Role = 'customer' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type IdType = 'national_id' | 'passport';

export type ResourceKey =
  | 'products'
  | 'categories'
  | 'orders'
  | 'users'
  | 'promoCodes'
  | 'sellers'
  | 'platformConfig';

// Modèle inspiré de Filament Shield : chaque ressource accorde une liste d'actions.
export type PermissionAction = 'view_any' | 'view' | 'create' | 'update' | 'delete';

export const RESOURCE_KEYS: ResourceKey[] = [
  'products',
  'categories',
  'orders',
  'users',
  'promoCodes',
  'sellers',
  'platformConfig',
];

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  products: 'Produits',
  categories: 'Catégories',
  orders: 'Commandes',
  users: 'Utilisateurs',
  promoCodes: 'Codes promo',
  sellers: 'Vendeurs',
  platformConfig: 'Paramètres',
};

export const PERMISSION_ACTIONS: PermissionAction[] = ['view_any', 'view', 'create', 'update', 'delete'];

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view_any: 'Voir (liste)',
  view: 'Voir (détail)',
  create: 'Créer',
  update: 'Modifier',
  delete: 'Supprimer',
};

export interface CustomRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: Partial<Record<ResourceKey, PermissionAction[]>>;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  blocked: boolean;
  customRoleId?: string | null;
  customRole: { id: string; name: string; permissions?: Partial<Record<ResourceKey, PermissionAction[]>> } | null;
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
  blocked: boolean;
  blockedAt: string | null;
  blockReason: string | null;
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
  activeSellerCount: number;
}

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface AnalyticsData {
  revenueTrend: { date: string; revenue: number }[];
  userGrowth: { date: string; newUsers: number }[];
  sellerGrowth: { date: string; newSellers: number }[];
  topProducts: { productId: string; name: string; unitsSold: number; revenue: number }[];
  topSellers: { sellerId: string; name: string; revenue: number; ordersCount: number }[];
  avgOrderValue: number;
  conversionRate: number;
  newUsersCount: number;
}

export interface PlatformConfigMap {
  commissionRate: number;
  sellerRegistrationEnabled: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order_status' | 'seller_status' | 'new_order' | 'new_seller_application' | 'low_stock';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
    sellerProfile?: SellerProfile;
  };
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}
