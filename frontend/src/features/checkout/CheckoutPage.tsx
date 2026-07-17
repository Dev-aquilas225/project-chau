import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CreditCard, Tag, Truck, ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCartStore } from '@/stores/cartStore';
import { validatePromo } from '@/features/orders/api';
import type { PromoValidationResult } from '@/types';
import { formatPrice } from '@/lib/utils';
import { LegalNotice } from '@/components/LegalNotice';
import { useCurrencyStore } from '@/stores/currencyStore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { apiFetch } from '@/lib/http';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_mock';
const isStripeConfigured = stripePublicKey && stripePublicKey.startsWith('pk_');
const stripePromise = isStripeConfigured ? loadStripe(stripePublicKey) : null;

interface AddressForm {
  fullName: string; 
  line1: string; 
  city: string; 
  zip: string; 
  country: string;
}

const CARRIERS = [
  { id: 'mondial_relay', name: 'Mondial Relay (Point Relais)', price: 3.90 },
  { id: 'colissimo', name: 'Colissimo (Domicile)', price: 6.50 },
  { id: 'chronopost', name: 'Chronopost Express', price: 8.20 },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('checkout');
  const { user, profile } = useAuth();
  const { items, subtotal, clear } = useCartStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    defaultValues: { fullName: profile?.displayName, country: 'France' },
  });

  const [promo, setPromo] = useState<PromoValidationResult | null>(null);
  const [code, setCode] = useState('');
  
  // Get offerId from URL
  const queryParams = new URLSearchParams(window.location.search);
  const offerId = queryParams.get('offerId') || undefined;
  const [negotiatedOffer, setNegotiatedOffer] = useState<any | null>(null);

  useEffect(() => {
    if (offerId) {
      apiFetch<any[]>('/offers/mine')
        .then((data) => {
          const found = data.find((o) => o.id === offerId && o.status === 'accepted');
          if (found) {
            setNegotiatedOffer(found);
          }
        })
        .catch(console.error);
    }
  }, [offerId]);

  // Override item price in checkout if there is an accepted offer
  const itemsToProcess = items.map((item) => {
    if (negotiatedOffer && item.productId === negotiatedOffer.productId) {
      return { ...item, unitPrice: parseFloat(negotiatedOffer.suggestedPrice) };
    }
    return item;
  });

  // Carrier selection
  const [selectedCarrierId, setSelectedCarrierId] = useState('mondial_relay');
  const carrier = CARRIERS.find(c => c.id === selectedCarrierId) || CARRIERS[0];
  const shippingFee = carrier.price;

  // Currency selection
  const currentCurrency = useCurrencyStore((s) => s.currentCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  const exchangeRate = rates[currentCurrency] || 1.0;

  // Stripe elements session state
  const [checkoutSession, setCheckoutSession] = useState<{
    clientSecret: string;
    orderId: string;
    isMock: boolean;
  } | null>(null);

  const [loadingSession, setLoadingSession] = useState(false);

  // Calculate subtotal from itemsToProcess
  const sub = itemsToProcess.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const discount = promo?.discount ?? 0;
  const totalEur = Math.max(0, sub - discount + shippingFee);

  if (items.length === 0) {
    return <div className="container-app py-16 text-center text-muted">{t('empty')}</div>;
  }

  const applyPromo = async () => {
    try {
      const p = await validatePromo(code, sub);
      setPromo(p);
      toast.success(t('toasts.promoApplied'));
    } catch (e) {
      setPromo(null);
      toast.error(e instanceof Error ? e.message : t('toasts.promoInvalid'));
    }
  };

  const onSubmit = async (address: AddressForm) => {
    if (!user) return;
    setLoadingSession(true);

    try {
      // Create checkout session (PaymentIntent) on backend
      const res = await apiFetch<{
        clientSecret: string;
        orderId: string;
        isMock: boolean;
      }>('/orders/checkout-session', {
        method: 'POST',
        body: {
          items: itemsToProcess.map((i) => ({ 
            productId: i.productId, 
            name: i.name, 
            brand: i.brand, 
            image: i.image, 
            unitPrice: i.unitPrice, 
            qty: i.qty 
          })),
          subtotal: sub,
          discount,
          total: totalEur,
          promoCode: promo?.code,
          shippingAddress: address,
          paymentMethod: 'stripe',
          shippingFee,
          carrierName: carrier.name,
          currency: currentCurrency,
          exchangeRate,
          offerId,
        }
      });

      setCheckoutSession(res);
    } catch (err) {
      toast.error('Impossible d\'initier la transaction de paiement.');
      console.error(err);
    } finally {
      setLoadingSession(false);
    }
  };

  const handlePaymentSuccess = () => {
    clear();
    toast.success(t('toasts.orderConfirmed'));
    navigate(`/commandes?last=${checkoutSession?.orderId}`);
  };

  const amountInCurrency = totalEur * exchangeRate;
  const formattedAmount = formatPrice(totalEur);

  return (
    <div className="container-app py-6 relative">
      <h1 className="mb-6 text-2xl font-bold text-ink">{t('title')}</h1>
      
      {/* Stripe elements modal overlay */}
      {checkoutSession && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          {checkoutSession.isMock || !stripePromise ? (
            <StripeCheckoutForm
              clientSecret={checkoutSession.clientSecret}
              orderId={checkoutSession.orderId}
              isMock={true}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setCheckoutSession(null)}
              amountFormatted={formattedAmount}
            />
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret: checkoutSession.clientSecret }}>
              <StripeCheckoutForm
                clientSecret={checkoutSession.clientSecret}
                orderId={checkoutSession.orderId}
                isMock={false}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setCheckoutSession(null)}
                amountFormatted={formattedAmount}
              />
            </Elements>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Adresse */}
          <section className="bg-paper p-5 rounded-xl border border-line">
            <h2 className="mb-4 text-lg font-semibold text-ink">{t('address.sectionTitle')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input sm:col-span-2 rounded-xl" placeholder={t('address.fullNamePlaceholder')} {...register('fullName', { required: true })} />
              <input className="input sm:col-span-2 rounded-xl" placeholder={t('address.line1Placeholder')} {...register('line1', { required: true })} />
              <input className="input rounded-xl" placeholder={t('address.cityPlaceholder')} {...register('city', { required: true })} />
              <input className="input rounded-xl" placeholder={t('address.zipPlaceholder')} {...register('zip', { required: true })} />
              <input className="input sm:col-span-2 rounded-xl" placeholder={t('address.countryPlaceholder')} {...register('country', { required: true })} />
            </div>
            {Object.keys(errors).length > 0 && <p className="mt-2 text-xs text-sale">{t('address.requiredError')}</p>}
          </section>

          {/* Mode de livraison Vinted-style */}
          <section className="bg-paper p-5 rounded-xl border border-line">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <Truck className="h-5 w-5" /> Mode de livraison
            </h2>
            <div className="space-y-2">
              {CARRIERS.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-4 text-sm hover:bg-gray-50 transition duration-150">
                  <span className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="carrier" 
                      checked={selectedCarrierId === c.id} 
                      onChange={() => setSelectedCarrierId(c.id)} 
                      className="text-ink focus:ring-ink"
                    />
                    <span className="font-medium text-ink">{c.name}</span>
                  </span>
                  <span className="font-semibold text-ink">{formatPrice(c.price)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Moyen de Paiement */}
          <section className="bg-paper p-5 rounded-xl border border-line">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink"><CreditCard className="h-5 w-5" /> {t('payment.sectionTitle')}</h2>
            <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 text-sm bg-gray-50/50">
              <div className="p-2 bg-ink text-paper rounded-lg">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-ink">Stripe Checkout</span>
                <p className="text-xs text-muted">Paiement 100% sécurisé et protégé. Les fonds sont gardés en séquestre.</p>
              </div>
            </div>
          </section>

          <LegalNotice />
        </div>

        {/* Récapitulatif de Commande */}
        <aside className="h-fit rounded-xl border border-line p-5 bg-paper shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-ink">{t('summary.title')}</h2>
          <ul className="mb-4 max-h-40 space-y-2 overflow-auto text-sm border-b border-line pb-4">
            {itemsToProcess.map((i) => (
              <li key={i.productId} className="flex justify-between items-center text-muted">
                <span className="truncate max-w-[200px] text-ink font-medium">{i.name}</span>
                <span>{formatPrice(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input className="input pl-9 rounded-xl" placeholder={t('summary.promoPlaceholder')} value={code} onChange={(e) => setCode(e.target.value)} data-testid="promo-input" />
            </div>
            <button type="button" className="btn-outline px-4 rounded-xl text-sm font-semibold" onClick={applyPromo}>{t('summary.promoApply')}</button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-muted">
            <div className="flex justify-between"><span>{t('summary.subtotal')}</span><span className="text-ink">{formatPrice(sub)}</span></div>
            <div className="flex justify-between"><span>Frais de port</span><span className="text-ink">{formatPrice(shippingFee)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sale font-medium"><span>{t('summary.discount', { code: promo?.code })}</span><span>−{formatPrice(discount)}</span></div>}
            <div className="flex justify-between font-bold text-ink border-t border-line pt-2 text-base"><span>{t('summary.total')}</span><span>{formatPrice(totalEur)}</span></div>
          </div>

          <button className="btn-primary mt-6 w-full rounded-xl py-3 font-bold shadow-md flex items-center justify-center gap-2" disabled={loadingSession} data-testid="place-order">
            {loadingSession ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initialisation...
              </>
            ) : (
              t('summary.payButton', { amount: formatPrice(totalEur) })
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}
