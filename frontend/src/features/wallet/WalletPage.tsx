import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { apiFetch } from '@/lib/http';
import { formatPrice } from '@/lib/utils';
import { Wallet, ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PayoutRequest {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'rejected';
  reviewNote: string | null;
  createdAt: string;
}

export function WalletPage() {
  const { user, refresh } = useAuth();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const balance = parseFloat(user?.walletBalance as any) || 0;
  const iban = user?.sellerProfile?.iban || '';

  const loadHistory = async () => {
    try {
      const data = await apiFetch<PayoutRequest[]>('/payouts/mine');
      setPayouts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }
    if (parsedAmount > balance) {
      toast.error('Solde insuffisant pour effectuer ce retrait.');
      return;
    }
    if (!iban) {
      toast.error('Veuillez renseigner votre IBAN dans vos paramètres vendeur avant de demander un retrait.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/payouts', {
        method: 'POST',
        body: { amount: parsedAmount },
      });
      toast.success(`Votre demande de retrait de ${formatPrice(parsedAmount)} a bien été prise en compte !`);
      setAmount('');
      await refresh();
      await loadHistory();
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue lors de la demande de retrait.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: PayoutRequest['status']) => {
    const badges = {
      pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="h-3.5 w-3.5" />, label: 'En attente' },
      processing: { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock className="h-3.5 w-3.5 animate-spin" />, label: 'En cours' },
      paid: { bg: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Virement envoyé' },
      rejected: { bg: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Refusé' },
    };

    const b = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${b.bg}`}>
        {b.icon}
        {b.label}
      </span>
    );
  };

  return (
    <div className="container-app py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-ink text-paper rounded-2xl shadow-sm">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Portefeuille Vendeur</h1>
          <p className="text-sm text-muted">Gérez vos gains de vente et vos demandes de virements IBAN.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Balance Card & Request Form */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-paper border border-line rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wallet className="h-24 w-24" />
            </div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Solde Disponible</p>
            <p className="text-3xl font-black text-ink">{formatPrice(balance)}</p>
            
            {iban ? (
              <div className="mt-4 pt-4 border-t border-line text-xs text-muted">
                <span className="font-semibold text-ink block">IBAN Enregistré :</span>
                <span className="font-mono block truncate mt-1 bg-gray-50 p-1.5 rounded-lg border border-line/45">{iban}</span>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-line flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Aucun IBAN configuré. Allez dans vos paramètres vendeur pour renseigner vos coordonnées bancaires.</p>
              </div>
            )}
          </div>

          {balance > 0 && iban && (
            <div className="bg-paper border border-line rounded-3xl p-6 shadow-md">
              <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4" /> Demander un retrait
              </h3>
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="label text-xs font-semibold mb-1">Montant à retirer (EUR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={balance}
                      className="input rounded-xl pr-10 py-2 text-sm font-semibold"
                      placeholder="Ex: 50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted text-xs">EUR</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer le retrait'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="md:col-span-2">
          <div className="bg-paper border border-line rounded-3xl p-6 shadow-md min-h-[300px] flex flex-col">
            <h3 className="font-bold text-ink mb-4 text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted" /> Historique des retraits
            </h3>

            {loadingHistory ? (
              <div className="flex-1 flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
            ) : payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line text-muted font-bold uppercase tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Montant</th>
                      <th className="py-2.5">Statut</th>
                      <th className="py-2.5">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 font-semibold text-ink">{formatPrice(p.amount)}</td>
                        <td className="py-3">{getStatusBadge(p.status)}</td>
                        <td className="py-3 text-muted truncate max-w-[150px]">{p.reviewNote || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
                <Clock className="h-10 w-10 text-muted/40 mb-2" />
                <p className="text-sm font-semibold text-muted">Aucune demande de retrait</p>
                <p className="text-xs text-muted/60 max-w-xs mt-1">Vos demandes de transferts bancaires apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
