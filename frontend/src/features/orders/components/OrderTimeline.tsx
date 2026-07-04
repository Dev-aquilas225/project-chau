import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate } from '@/lib/utils';
import type { OrderStatus, OrderStatusHistoryEntry } from '@/types';

const STATUS_STEPS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

const STATUS_ICON: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  paid: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export interface OrderTimelineProps {
  status: OrderStatus;
  statusHistory?: OrderStatusHistoryEntry[];
}

/** Timeline verticale de l'avancement d'une commande (pending -> paid -> shipped -> delivered, ou cancelled). */
export function OrderTimeline({ status, statusHistory = [] }: OrderTimelineProps) {
  const { t } = useTranslation(['orders', 'common']);
  const historyByStatus = new Map(statusHistory.map((h) => [h.status, h]));

  if (status === 'cancelled') {
    const steps: OrderStatus[] = [...STATUS_STEPS, 'cancelled'];
    return (
      <ol className="space-y-4" data-testid="order-timeline">
        {steps.map((step) => {
          const entry = historyByStatus.get(step);
          const reached = !!entry;
          const isCurrent = step === 'cancelled';
          const Icon = STATUS_ICON[step];
          return (
            <li key={step} className="flex gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                  isCurrent ? 'border-red-500 bg-red-50 text-red-600' : reached ? 'border-ink bg-ink/5 text-ink' : 'border-line text-muted',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn('text-sm font-medium', isCurrent ? 'text-red-600' : reached ? 'text-ink' : 'text-muted')}>
                  {t(`common:orderStatus.${step}`)}
                </p>
                {entry && <p className="text-xs text-muted">{formatDate(entry.createdAt)}</p>}
                {entry?.note && <p className="text-xs text-muted">{entry.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <ol className="space-y-4" data-testid="order-timeline">
      {STATUS_STEPS.map((step, i) => {
        const entry = historyByStatus.get(step);
        const isCurrent = i === currentIndex;
        const isPast = i < currentIndex;
        const isFuture = i > currentIndex;
        const Icon = STATUS_ICON[step];
        return (
          <li key={step} className="flex gap-3">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                isCurrent
                  ? 'border-ink bg-ink text-white'
                  : isPast
                    ? 'border-ink bg-ink/5 text-ink'
                    : 'border-line text-muted',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className={cn('text-sm font-medium', isFuture ? 'text-muted' : 'text-ink', isCurrent && 'font-semibold')}>
                {t(`common:orderStatus.${step}`)}
              </p>
              {entry ? (
                <>
                  <p className="text-xs text-muted">{formatDate(entry.createdAt)}</p>
                  {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                </>
              ) : isFuture ? (
                <p className="text-xs text-muted">{t('timeline.upcoming')}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
