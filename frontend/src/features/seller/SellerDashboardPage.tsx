import { Link } from 'react-router-dom';
import { Package, ShoppingCart, PlusCircle, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMyListings, useSellerOrders } from './hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatPrice } from '@/lib/utils';

export function SellerDashboardPage() {
  const { t } = useTranslation('seller');
  const { profile } = useAuth();
  const { data: listings = [] } = useMyListings();
  const { data: orders = [] } = useSellerOrders();

  const activeListings = listings.filter((l) => l.listingStatus === 'active').length;
  const revenue = orders
    .filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-center gap-3">
        <Store className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          {profile?.sellerProfile?.storeName && (
            <p className="text-muted">{profile.sellerProfile.storeName}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm text-muted">{t('dashboard.stats.activeListings')}</p>
          <p className="text-2xl font-semibold">{activeListings}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm text-muted">{t('dashboard.stats.ordersReceived')}</p>
          <p className="text-2xl font-semibold">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-line p-4">
          <p className="text-sm text-muted">{t('dashboard.stats.revenue')}</p>
          <p className="text-2xl font-semibold">{formatPrice(revenue)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/espace-vendeur/annonces" className="card flex items-center gap-4 hover:shadow-md transition-shadow">
          <Package className="h-8 w-8" />
          <div>
            <p className="font-semibold">{t('dashboard.actions.myListingsTitle')}</p>
            <p className="text-sm text-muted">{t('dashboard.actions.myListingsSubtitle')}</p>
          </div>
        </Link>
        <Link to="/espace-vendeur/annonces/creer" className="card flex items-center gap-4 hover:shadow-md transition-shadow">
          <PlusCircle className="h-8 w-8" />
          <div>
            <p className="font-semibold">{t('dashboard.actions.newListingTitle')}</p>
            <p className="text-sm text-muted">{t('dashboard.actions.newListingSubtitle')}</p>
          </div>
        </Link>
        <Link to="/espace-vendeur/commandes" className="card flex items-center gap-4 hover:shadow-md transition-shadow">
          <ShoppingCart className="h-8 w-8" />
          <div>
            <p className="font-semibold">{t('dashboard.actions.ordersTitle')}</p>
            <p className="text-sm text-muted">{t('dashboard.actions.ordersSubtitle')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
