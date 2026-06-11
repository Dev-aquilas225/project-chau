import { useAdminOrders, ORDER_STATUS_LABEL } from '@/features/orders/hooks';
import { formatPrice, formatDate, cn } from '@/lib/utils';

const PAID = ['paid', 'shipped', 'delivered'];
const methodLabel: Record<string, string> = { card: 'Carte bancaire', paypal: 'PayPal', klarna: 'Klarna' };

export function PaymentsPage() {
  const { data: orders = [], isLoading } = useAdminOrders();

  const settled = orders.filter((o) => PAID.includes(o.status));
  const revenue = settled.reduce((s, o) => s + o.total, 0);
  const refunds = orders.filter((o) => o.status === 'cancelled').reduce((s, o) => s + o.total, 0);

  const byMethod = settled.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
    const m = o.paymentMethod || 'inconnu';
    acc[m] = acc[m] || { count: 0, total: 0 };
    acc[m].count += 1; acc[m].total += o.total;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-6 text-2xl">Paiements (monétique)</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-xs uppercase text-muted">Encaissé</p><p className="text-2xl font-semibold text-green-700">{formatPrice(revenue)}</p></div>
        <div className="card"><p className="text-xs uppercase text-muted">Transactions</p><p className="text-2xl font-semibold">{settled.length}</p></div>
        <div className="card"><p className="text-xs uppercase text-muted">Remboursé (annulé)</p><p className="text-2xl font-semibold text-sale">{formatPrice(refunds)}</p></div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {Object.entries(byMethod).map(([m, v]) => (
          <div key={m} className="card">
            <p className="font-medium">{methodLabel[m] ?? m}</p>
            <p className="text-sm text-muted">{v.count} transaction(s)</p>
            <p className="mt-1 text-lg font-semibold">{formatPrice(v.total)}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b border-line bg-gray-50">
            <tr><th className="th">Transaction</th><th className="th">Date</th><th className="th">Moyen</th><th className="th">Montant</th><th className="th">Statut</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? <tr><td className="td" colSpan={5}>Chargement…</td></tr>
            : orders.length === 0 ? <tr><td className="td text-muted" colSpan={5}>Aucune transaction.</td></tr>
            : orders.map((o) => (
              <tr key={o.id}>
                <td className="td font-mono text-xs">#{o.id.slice(0, 10).toUpperCase()}</td>
                <td className="td text-muted">{formatDate(o.createdAt)}</td>
                <td className="td">{methodLabel[o.paymentMethod] ?? o.paymentMethod}</td>
                <td className="td font-semibold">{formatPrice(o.total)}</td>
                <td className="td">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs',
                    PAID.includes(o.status) ? 'bg-green-100 text-green-800' : o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Vue construite à partir des commandes. L'intégration d'un prestataire de paiement réel (Stripe, Adyen…)
        se fait côté serveur (Cloud Function/webhook) — aucun secret de paiement ne doit transiter par le frontend.
      </p>
    </div>
  );
}
