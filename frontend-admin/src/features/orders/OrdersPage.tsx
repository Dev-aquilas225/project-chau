import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminOrders, useUpdateOrderStatus, ORDER_STATUS_LABEL, ORDER_STATUSES } from './hooks';
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

  const change = async (id: string, status: OrderStatus) => {
    try { await updateStatus.mutateAsync({ id, status }); toast.success('Statut mis à jour'); }
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
                      onChange={(e) => change(o.id, e.target.value as OrderStatus)}
                      className={cn('rounded-full border-0 px-2 py-1 text-xs font-medium', statusColor[o.status])}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                    </select>
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
                      <div className="grid gap-4 md:grid-cols-2">
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
