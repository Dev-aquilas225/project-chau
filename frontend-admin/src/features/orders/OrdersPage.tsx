import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminOrders, useAdminOrder, useUpdateOrderStatus, ORDER_STATUS_LABEL, ORDER_STATUSES } from './hooks';
import { OrderTimeline } from './components/OrderTimeline';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800', paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};

export function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const { data: orders = [], isLoading } = useAdminOrders(filter || undefined);
  const updateStatus = useUpdateOrderStatus();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [note, setNote] = useState('');

  const change = async (id: string, status: OrderStatus, noteValue?: string) => {
    try { await updateStatus.mutateAsync({ id, status, note: noteValue }); toast.success('Statut mis à jour'); setPendingStatus(null); setNote(''); }
    catch { toast.error('Mise à jour impossible'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Commandes</h1>
        <select className="input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | '')}>
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b border-line bg-gray-50">
            <tr><th className="th">N°</th><th className="th">Date</th><th className="th">Articles</th><th className="th">Total</th><th className="th">Statut</th><th className="th"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? <tr><td className="td" colSpan={6}>Chargement…</td></tr>
            : orders.length === 0 ? <tr><td className="td text-muted" colSpan={6}>Aucune commande.</td></tr>
            : orders.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td className="td font-medium">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="td text-muted">{formatDate(o.createdAt)}</td>
                  <td className="td">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td className="td font-semibold">{formatPrice(o.total)}</td>
                  <td className="td">
                    <select
                      value={o.status}
                      onChange={(e) => setPendingStatus({ id: o.id, status: e.target.value as OrderStatus })}
                      className={cn('rounded-full border-0 px-2 py-1 text-xs font-medium', statusColor[o.status])}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                    </select>
                    {pendingStatus?.id === o.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Note (optionnel)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="input h-8 max-w-[180px] text-xs"
                          data-testid={`status-note-${o.id}`}
                        />
                        <button
                          type="button"
                          className="rounded bg-ink px-2 py-1 text-xs font-medium text-white"
                          onClick={() => change(pendingStatus.id, pendingStatus.status, note || undefined)}
                          data-testid={`confirm-status-${o.id}`}
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          className="text-xs text-muted"
                          onClick={() => { setPendingStatus(null); setNote(''); }}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="td">
                    <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} aria-label="Détails">
                      {expanded === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-gray-50">
                    <td className="td" colSpan={6}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-muted">Articles</p>
                          <ul className="space-y-1 text-sm">
                            {o.items.map((i) => (
                              <li key={i.productId} className="flex justify-between">
                                <span>{i.brand} {i.name} ×{i.qty}</span><span>{formatPrice(i.unitPrice * i.qty)}</span>
                              </li>
                            ))}
                          </ul>
                          {o.promoCode && <p className="mt-1 text-xs text-sale">Code : {o.promoCode} (−{formatPrice(o.discount)})</p>}
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-muted">Livraison & paiement</p>
                          {o.shippingAddress && (
                            <p className="text-sm">{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}, {o.shippingAddress.zip} {o.shippingAddress.city}, {o.shippingAddress.country}</p>
                          )}
                          <p className="mt-2 text-sm text-muted">Paiement : {o.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-muted">Suivi</p>
                          <OrderTimelineSection orderId={o.id} fallbackStatus={o.status} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderTimelineSection({ orderId, fallbackStatus }: { orderId: string; fallbackStatus: OrderStatus }) {
  const { data: order, isLoading } = useAdminOrder(orderId);

  if (isLoading) return <p className="text-sm text-muted">Chargement…</p>;

  return <OrderTimeline status={order?.status ?? fallbackStatus} statusHistory={order?.statusHistory} />;
}
