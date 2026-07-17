import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, Star, Loader2, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/http';
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
  const { data: orders, isLoading, refetch } = useMyOrders(user?.id);
  const [params] = useSearchParams();
  const last = params.get('last');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Review and confirmation state
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSellerId, setReviewSellerId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [confirmingLoading, setConfirmingLoading] = useState<string | null>(null);

  const handleConfirmReceipt = async (order: any) => {
    setConfirmingLoading(order.id);
    try {
      await apiFetch(`/orders/${order.id}/confirm-receipt`, { method: 'POST' });
      toast.success('Réception confirmée avec succès !');
      refetch();
      if (order.sellerId) {
        setConfirmingOrderId(order.id);
        setReviewSellerId(order.sellerId);
        setShowReviewModal(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la confirmation.');
    } finally {
      setConfirmingLoading(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSellerId || !confirmingOrderId) return;
    setSubmittingReview(true);
    try {
      await apiFetch(`/users/${reviewSellerId}/reviews`, {
        method: 'POST',
        body: { rating, comment: comment.trim(), orderId: confirmingOrderId },
      });
      toast.success('Merci pour votre évaluation !');
      setShowReviewModal(false);
      setComment('');
      setRating(5);
      setConfirmingOrderId(null);
      setReviewSellerId(null);
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'enregistrer votre avis.');
    } finally {
      setSubmittingReview(false);
    }
  };

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

              <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm items-center">
                <span className="text-muted">{t('itemsCount', { count: o.items.reduce((n, i) => n + i.qty, 0) })}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </div>

              {/* confirm receipt action */}
              {!o.buyerConfirmed && (o.status === 'shipped' || o.status === 'paid') && (
                <button
                  type="button"
                  disabled={confirmingLoading === o.id}
                  onClick={() => handleConfirmReceipt(o)}
                  className="btn-primary w-full py-2.5 rounded-xl font-bold text-xs mt-3 flex items-center justify-center gap-2"
                >
                  {confirmingLoading === o.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirmation en cours...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3px]" />
                      Tout est OK - Valider la réception
                    </>
                  )}
                </button>
              )}

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

      {/* User Review C2C Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper p-6 rounded-2xl border border-line shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-ink text-base">Évaluer le vendeur</h3>
              <button type="button" onClick={() => setShowReviewModal(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="text-left">
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Veuillez laisser une note et un avis pour évaluer la transaction avec le vendeur de cet article.
                </p>
                
                <label className="label text-xs font-semibold mb-2">Note (de 1 à 5 étoiles)</label>
                <div className="flex gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="focus:outline-none transition"
                    >
                      <Star className={cn("h-6 w-6 transition", n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                    </button>
                  ))}
                </div>

                <label className="label text-xs font-semibold mb-1">Votre commentaire (optionnel)</label>
                <textarea
                  className="input rounded-xl text-sm"
                  placeholder="Comment s'est passée la transaction ? Rapidité d'envoi, état du colis..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="btn-outline flex-1 rounded-xl py-2.5 text-xs font-semibold border-gray-200"
                  onClick={() => setShowReviewModal(false)}
                >
                  Passer
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary flex-1 rounded-xl py-2.5 text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  {submittingReview ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Valider l\'avis'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
