import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSellerOrders } from './hooks';
import { formatPrice, formatDate, cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export function SellerOrdersPage() {
  const { t } = useTranslation(['seller', 'common']);
  const { data: orders = [], isLoading } = useSellerOrders();

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('sellerOrders.title')}</h1>

      {isLoading ? (
        <p className="text-muted">{t('sellerOrders.loading')}</p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted" />
          <p className="text-muted">{t('sellerOrders.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLOR[order.status] ?? '')}>
                  {t(`common:orderStatus.${order.status}`, { defaultValue: order.status })}
                </span>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  {order.sellerPayout != null && (
                    <p className="text-xs text-muted">{t('sellerOrders.yourShare')} {formatPrice(order.sellerPayout)}</p>
                  )}
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-line pt-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span>{item.brand} {item.name} × {item.qty}</span>
                    <span>{formatPrice(item.unitPrice * item.qty)}</span>
                  </li>
                ))}
              </ul>
              {order.shippingAddress && (
                <p className="mt-2 text-xs text-muted">
                  {t('sellerOrders.shippingLabel')} {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.zip} {order.shippingAddress.city}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
