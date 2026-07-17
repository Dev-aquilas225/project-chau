import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/http';

interface StripeCheckoutFormProps {
  clientSecret: string;
  orderId: string;
  isMock: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  amountFormatted: string;
}

export function StripeCheckoutForm({
  clientSecret,
  orderId,
  isMock,
  onSuccess,
  onCancel,
  amountFormatted,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleMockPayment = async () => {
    setLoading(true);
    try {
      // Call mock payment confirm on backend
      await apiFetch(`/stripe/mock-confirm/${orderId}`, { method: 'POST' });
      toast.success('Paiement simulé validé avec succès !');
      onSuccess();
    } catch (err) {
      toast.error('Échec de la validation du paiement simulé.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/commandes?last=${orderId}&payment=success`,
        },
      });

      if (error) {
        toast.error(error.message || 'Le paiement a échoué.');
      } else {
        // Confirmation is handled by webhook, but we notify client
        onSuccess();
      }
    } catch (err) {
      toast.error('Une erreur est survenue lors de la confirmation du paiement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-paper rounded-2xl border border-line p-6 shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3 border-b border-line pb-4 mb-6">
        <div className="p-2 bg-ink text-paper rounded-lg">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-ink">Finaliser le paiement</h3>
          <p className="text-xs text-muted">Montant à débiter : <span className="font-bold text-ink">{amountFormatted}</span></p>
        </div>
      </div>

      {isMock ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-gray-50 border border-line rounded-xl text-xs text-muted text-left leading-relaxed">
            <p className="font-semibold text-ink mb-1">💡 Mode Développeur (Simulation)</p>
            <p>Le backend fonctionne sans clé Stripe réelle. Vous pouvez valider cette transaction instantanément en simulant le paiement.</p>
          </div>
          
          <button
            type="button"
            onClick={handleMockPayment}
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:bg-ink/90 transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validation du paiement...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Valider le paiement simulé
              </>
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleStripePayment} className="space-y-6">
          <PaymentElement />
          
          <button
            type="submit"
            disabled={loading || !stripe}
            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:bg-ink/90 transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              `Payer ${amountFormatted}`
            )}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="btn-outline w-full py-3 mt-3 rounded-xl text-sm font-semibold border-gray-200 hover:bg-gray-50 transition duration-200"
      >
        Annuler
      </button>
    </div>
  );
}
