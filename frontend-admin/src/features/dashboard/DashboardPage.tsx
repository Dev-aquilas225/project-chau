import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, UserCheck, Loader2 } from 'lucide-react';
import { useAdminOrders, ORDER_STATUS_LABEL } from '@/features/orders/hooks';
import { useAdminProducts } from '@/features/products/hooks';
import { listSellers } from '@/features/sellers/api';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const PAID_STATUSES = ['paid', 'shipped', 'delivered'];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800', paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};
const STATUS_BAR: Record<OrderStatus, string> = {
  pending: 'bg-amber-400', paid: 'bg-blue-500',
  shipped: 'bg-indigo-500', delivered: 'bg-green-500', cancelled: 'bg-red-400',
};

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="card flex items-center gap-4 transition-shadow hover:shadow-md">
      <div className={cn('rounded-lg p-3', accent ?? 'bg-gray-100 text-gray-700')}><Icon className="h-6 w-6" /></div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: orders = [], isLoading } = useAdminOrders();
  const { data: products = [] } = useAdminProducts();
  const { data: pendingSellers = [] } = useQuery({ queryKey: ['admin-sellers', 'pending'], queryFn: () => listSellers('pending') });

  const revenue = orders.filter((o) => PAID_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const itemsSold = orders.filter((o) => PAID_STATUSES.includes(o.status)).reduce((s, o) => s + o.items.reduce((n, i) => n + Number(i.qty), 0), 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 2).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const byStatus = (['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const).map((s) => ({
    status: s, count: orders.filter((o) => o.status === s).length,
  }));
  const maxCount = Math.max(1, ...byStatus.map((b) => b.count));

  const recent: Order[] = orders.slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Chiffre d'affaires" value={formatPrice(revenue)} accent="bg-green-100 text-green-700" />
        <StatCard icon={ShoppingCart} label="Commandes" value={String(orders.length)} accent="bg-blue-100 text-blue-700" />
        <StatCard icon={TrendingUp} label="Articles vendus" value={String(itemsSold)} accent="bg-indigo-100 text-indigo-700" />
        <StatCard icon={Package} label="Produits actifs" value={String(products.filter((p) => p.active).length)} accent="bg-purple-100 text-purple-700" />
      </div>

      {pendingSellers.length > 0 && (
        <Link to="/vendeurs" className="mt-4 flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800 transition-shadow hover:shadow-md">
          <UserCheck className="h-5 w-5" />
          <span><b>{pendingSellers.length}</b> candidature(s) vendeur en attente de validation.</span>
          <span className="ml-auto underline">Gérer les vendeurs →</span>
        </Link>
      )}

      {(lowStock > 0 || outOfStock > 0) && (
        <Link to="/stock" className="mt-4 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 transition-shadow hover:shadow-md">
          <AlertTriangle className="h-5 w-5" />
          {outOfStock > 0 && <span><b>{outOfStock}</b> produit(s) en rupture.</span>}
          {lowStock > 0 && <span><b>{lowStock}</b> produit(s) en stock faible.</span>}
          <span className="ml-auto underline">Gérer le stock →</span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg">Commandes par statut</h2>
          <div className="space-y-3">
            {byStatus.map((b) => (
              <div key={b.status} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-muted">{ORDER_STATUS_LABEL[b.status]}</span>
                <div className="h-3 flex-1 rounded-full bg-gray-100">
                  <div
                    className={cn('h-3 rounded-full transition-all', STATUS_BAR[b.status])}
                    style={{ width: `${(b.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg">Commandes récentes</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(o.total)}</p>
                    <span className={cn('mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium', STATUS_BADGE[o.status])}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/commandes" className="mt-3 inline-block text-sm underline">Toutes les commandes →</Link>
        </div>
      </div>
    </div>
  );
}
