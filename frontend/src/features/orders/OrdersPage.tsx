import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMyOrders, useOrder } from './hooks';
import { OrderTimeline } from './components/OrderTimeline';
import { Spinner } from '@/components/ui/Spinner';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const STATUS_STEPS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrdersPage() {
  const { t } = useTranslation(['orders', 'common']);
  const { user } = useAuth();
  const { data: orders, isLoading } = useMyOrders(user?.id);
  const [params] = useSearchParams();
  const last = params.get('last');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="container-app py-16 text-center text-muted">
        <Package className="mx-auto mb-3 h-10 w-10" />
        <p>{t('empty')}</p>
        <Link to="/catalogue" className="btn-outline mt-4">{t('browseCatalog')}</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <h1 className="mb-6 text-2xl">{t('title')}</h1>
      <div className="space-y-4">
        {orders.map((o) => {
          const stepIndex = STATUS_STEPS.indexOf(o.status);
          return (
            <article key={o.id} className={cn('rounded-lg border p-4', o.id === last ? 'border-ink' : 'border-line')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted">{t('orderNumber', { id: o.id.slice(0, 8).toUpperCase() })}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColor[o.status])}>
                  {t(`common:orderStatus.${o.status}`)}
                </span>
              </div>

              {/* Suivi */}
              {o.status !== 'cancelled' && (
                <div className="my-4 flex items-center gap-1">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center gap-1">
                      <div className={cn('h-2 flex-1 rounded-full', i <= stepIndex ? 'bg-ink' : 'bg-line')} />
                    </div>
                  ))}
                </div>
              )}

              <ul className="flex gap-2 overflow-x-auto no-scrollbar">
                {o.items.map((i) => (
                  <li key={i.productId} className="flex shrink-0 items-center gap-2 text-sm">
                    <div className="h-14 w-11 overflow-hidden bg-gray-100">
                      {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
                    </div>
                    <span className="text-muted">×{i.qty}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
                <span className="text-muted">{t('itemsCount', { count: o.items.reduce((n, i) => n + i.qty, 0) })}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </div>

              <button
                type="button"
                data-testid={`toggle-timeline-${o.id}`}
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="mt-3 flex w-full items-center justify-center gap-1 border-t border-line pt-3 text-sm text-muted hover:text-ink"
              >
                {expanded === o.id ? <>{t('hideTimeline')} <ChevronUp className="h-4 w-4" /></> : <>{t('showTimeline')} <ChevronDown className="h-4 w-4" /></>}
              </button>

              {expanded === o.id && <OrderTimelineSection orderId={o.id} fallbackStatus={o.status} />}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function OrderTimelineSection({ orderId, fallbackStatus }: { orderId: string; fallbackStatus: OrderStatus }) {
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) return <div className="flex justify-center py-4"><Spinner /></div>;

  return (
    <div className="mt-4 border-t border-line pt-4">
      <OrderTimeline status={order?.status ?? fallbackStatus} statusHistory={order?.statusHistory} />
    </div>
  );
}
