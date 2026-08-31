import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CreditCard, Tag, Truck, Loader2, Package, AlertCircle } from 'lucide-react';
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
import { useShippingZone } from '@/features/shipping/hooks';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_mock';
const isStripeConfigured = stripePublicKey && stripePublicKey.startsWith('pk_');
const stripePromise = isStripeConfigured ? loadStripe(stripePublicKey) : null;

// ─── Liste complète de pays (code ISO → libellé) ────────────────────────────
const COUNTRIES: { code: string; label: string }[] = [
  { code: 'AF', label: 'Afghanistan' },
  { code: 'ZA', label: 'Afrique du Sud' },
  { code: 'AL', label: 'Albanie' },
  { code: 'DZ', label: 'Algérie' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'AO', label: 'Angola' },
  { code: 'SA', label: 'Arabie Saoudite' },
  { code: 'AR', label: 'Argentine' },
  { code: 'AU', label: 'Australie' },
  { code: 'AT', label: 'Autriche' },
  { code: 'BE', label: 'Belgique' },
  { code: 'BJ', label: 'Bénin' },
  { code: 'BR', label: 'Brésil' },
  { code: 'BF', label: 'Burkina Faso' },
  { code: 'BI', label: 'Burundi' },
  { code: 'CM', label: 'Cameroun' },
  { code: 'CA', label: 'Canada' },
  { code: 'CF', label: 'Centrafrique' },
  { code: 'CL', label: 'Chili' },
  { code: 'CN', label: 'Chine' },
  { code: 'CG', label: 'Congo' },
  { code: 'CD', label: 'Congo (RDC)' },
  { code: 'CI', label: "Côte d'Ivoire" },
  { code: 'HR', label: 'Croatie' },
  { code: 'DK', label: 'Danemark' },
  { code: 'EG', label: 'Égypte' },
  { code: 'AE', label: 'Émirats Arabes Unis' },
  { code: 'ES', label: 'Espagne' },
  { code: 'US', label: 'États-Unis' },
  { code: 'ET', label: 'Éthiopie' },
  { code: 'FI', label: 'Finlande' },
  { code: 'FR', label: 'France' },
  { code: 'GA', label: 'Gabon' },
  { code: 'GH', label: 'Ghana' },
  { code: 'GR', label: 'Grèce' },
  { code: 'GN', label: 'Guinée' },
  { code: 'IN', label: 'Inde' },
  { code: 'IE', label: 'Irlande' },
  { code: 'IL', label: 'Israël' },
  { code: 'IT', label: 'Italie' },
  { code: 'JP', label: 'Japon' },
  { code: 'JO', label: 'Jordanie' },
  { code: 'KE', label: 'Kenya' },
  { code: 'LB', label: 'Liban' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'MG', label: 'Madagascar' },
  { code: 'ML', label: 'Mali' },
  { code: 'MA', label: 'Maroc' },
  { code: 'MR', label: 'Mauritanie' },
  { code: 'MX', label: 'Mexique' },
  { code: 'MZ', label: 'Mozambique' },
  { code: 'NL', label: 'Pays-Bas' },
  { code: 'NE', label: 'Niger' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'NO', label: 'Norvège' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'PL', label: 'Pologne' },
  { code: 'PT', label: 'Portugal' },
  { code: 'QA', label: 'Qatar' },
  { code: 'RW', label: 'Rwanda' },
  { code: 'SN', label: 'Sénégal' },
  { code: 'RS', label: 'Serbie' },
  { code: 'SL', label: 'Sierra Leone' },
  { code: 'SE', label: 'Suède' },
  { code: 'CH', label: 'Suisse' },
  { code: 'TZ', label: 'Tanzanie' },
  { code: 'TD', label: 'Tchad' },
  { code: 'TG', label: 'Togo' },
  { code: 'TN', label: 'Tunisie' },
  { code: 'TR', label: 'Turquie' },
  { code: 'UG', label: 'Ouganda' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'UY', label: 'Uruguay' },
];

interface AddressForm {
  fullName: string;
  line1: string;
  city: string;
  zip: string;
  country: string; // code ISO 2 lettres
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('checkout');
  const { user, profile } = useAuth();
  const { items, clear } = useCartStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AddressForm>({
    defaultValues: { fullName: profile?.displayName ?? '', country: 'FR' },
  });

  const [promo, setPromo] = useState<PromoValidationResult | null>(null);
  const [code, setCode] = useState('');

  // Offre négociée depuis l'URL
  const queryParams = new URLSearchParams(window.location.search);
  const offerId = queryParams.get('offerId') || undefined;
  const [negotiatedOffer, setNegotiatedOffer] = useState<any | null>(null);

  useEffect(() => {
    if (offerId) {
      apiFetch<any[]>('/offers/mine')
        .then((data) => {
          const found = data.find((o) => o.id === offerId && o.status === 'accepted');
          if (found) setNegotiatedOffer(found);
        })
        .catch(console.error);
    }
  }, [offerId]);

  // Articles avec prix corrigés (offre négociée + coercion numérique)
  const itemsToProcess = items.map((item) => {
    if (negotiatedOffer && item.productId === negotiatedOffer.productId) {
      return { ...item, unitPrice: parseFloat(negotiatedOffer.suggestedPrice) };
    }
    return { ...item, unitPrice: Number(item.unitPrice) };
  });

  // Sous-total et remise
  const sub = itemsToProcess.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const discount = promo?.discount ?? 0;

  // Pays sélectionné (code ISO 2 lettres)
  const selectedCountry = watch('country') ?? 'FR';

  // Zone de livraison dynamique
  const { data: shippingData, isLoading: loadingZone } = useShippingZone(selectedCountry, sub - discount);
  const shippingZone = shippingData?.zone ?? null;
  const shippingFee = shippingData?.fee ?? 0;
  const shippingIsFree = shippingData?.isFree ?? false;

  // Total final
  const totalEur = Math.max(0, Math.round((sub - discount + shippingFee) * 100) / 100);

  // Devise
  const currentCurrency = useCurrencyStore((s) => s.currentCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  const exchangeRate = rates[currentCurrency] || 1.0;

  // Session Stripe
  const [checkoutSession, setCheckoutSession] = useState<{
    clientSecret: string;
    orderId: string;
    isMock: boolean;
  } | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);

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
    if (!shippingZone && !loadingZone) {
      toast.error('Aucune zone de livraison disponible pour ce pays.');
      return;
    }
    setLoadingSession(true);
    // Convertir le code pays en libellé pour l'adresse de livraison stockée
    const countryLabel = COUNTRIES.find((c) => c.code === address.country)?.label ?? address.country;

    try {
      const res = await apiFetch<{ clientSecret: string; orderId: string; isMock: boolean }>(
        '/orders/checkout-session',
        {
          method: 'POST',
          body: {
            items: itemsToProcess.map((i) => ({
              productId: i.productId,
              name: i.name,
              brand: i.brand,
              image: i.image,
              unitPrice: i.unitPrice,
              qty: i.qty,
            })),
            subtotal: sub,
            discount,
            total: totalEur,
            promoCode: promo?.code,
            shippingAddress: { ...address, country: countryLabel },
            paymentMethod: 'stripe',
            shippingFee,
            carrierName: shippingZone?.carrier ?? '',
            currency: currentCurrency,
            exchangeRate,
            offerId,
          },
        },
      );
      setCheckoutSession(res);
    } catch (err) {
      toast.error("Impossible d'initier la transaction de paiement.");
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

  const formattedAmount = formatPrice(totalEur);

  return (
    <div className="container-app py-6 relative">
      <h1 className="mb-6 text-2xl font-bold text-ink">{t('title')}</h1>

      {/* Stripe modal */}
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

          {/* ── Adresse de livraison ── */}
          <section className="bg-paper p-5 rounded-xl border border-line">
            <h2 className="mb-4 text-lg font-semibold text-ink">{t('address.sectionTitle')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input sm:col-span-2 rounded-xl"
                placeholder={t('address.fullNamePlaceholder')}
                {...register('fullName', { required: true })}
              />
              <input
                className="input sm:col-span-2 rounded-xl"
                placeholder={t('address.line1Placeholder')}
                {...register('line1', { required: true })}
              />
              <input
                className="input rounded-xl"
                placeholder={t('address.cityPlaceholder')}
                {...register('city', { required: true })}
              />
              <input
                className="input rounded-xl"
                placeholder={t('address.zipPlaceholder')}
                {...register('zip', { required: true })}
              />
              {/* Sélecteur de pays — remplace le champ texte libre */}
              <div className="sm:col-span-2">
                <label className="label text-sm font-medium mb-1 block">Pays de livraison</label>
                <select
                  className="input rounded-xl py-2.5"
                  {...register('country', { required: true })}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="mt-2 text-xs text-sale">{t('address.requiredError')}</p>
            )}
          </section>

          {/* ── Zone de livraison dynamique ── */}
          <section className="bg-paper p-5 rounded-xl border border-line">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <Truck className="h-5 w-5" /> Mode de livraison
            </h2>

            {loadingZone ? (
              <div className="flex items-center gap-3 py-4 text-muted text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calcul des frais de livraison…
              </div>
            ) : shippingZone ? (
              <div className="flex items-center justify-between rounded-xl border border-ink/20 bg-gray-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-ink text-paper rounded-lg mt-0.5">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{shippingZone.carrier}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {shippingZone.estimatedDaysMin}–{shippingZone.estimatedDaysMax} jours ouvrés
                      &nbsp;·&nbsp; Expédié depuis Paris, France
                    </p>
                    {shippingIsFree && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        🎉 Livraison offerte dès {shippingZone.freeThreshold} €
                      </p>
                    )}
                    {!shippingIsFree && shippingZone.freeThreshold && (
                      <p className="text-xs text-muted mt-1">
                        Gratuit dès{' '}
                        <span className="font-medium">{formatPrice(shippingZone.freeThreshold)}</span>
                        {' '}d'achats
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {shippingIsFree ? (
                    <div>
                      <span className="line-through text-muted text-xs">
                        {formatPrice(Number(shippingZone.basePrice))}
                      </span>
                      <p className="font-bold text-green-600 text-sm">Gratuit</p>
                    </div>
                  ) : (
                    <p className="font-bold text-ink text-sm">{formatPrice(shippingFee)}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4 text-amber-600 text-sm rounded-xl border border-amber-100 bg-amber-50/50 px-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Aucune zone de livraison disponible pour ce pays. Contactez-nous.</span>
              </div>
            )}
          </section>

          {/* ── Paiement ── */}
          <section className="bg-paper p-5 rounded-xl border border-line">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
              <CreditCard className="h-5 w-5" /> {t('payment.sectionTitle')}
            </h2>
            <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 text-sm bg-gray-50/50">
              <div className="p-2 bg-ink text-paper rounded-lg">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-ink">Stripe Checkout</span>
                <p className="text-xs text-muted">
                  Paiement 100% sécurisé et protégé. Les fonds sont gardés en séquestre.
                </p>
              </div>
            </div>
          </section>

          <LegalNotice />
        </div>

        {/* ── Récapitulatif ── */}
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

          {/* Code promo */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="input pl-9 rounded-xl"
                placeholder={t('summary.promoPlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                data-testid="promo-input"
              />
            </div>
            <button
              type="button"
              className="btn-outline px-4 rounded-xl text-sm font-semibold"
              onClick={applyPromo}
            >
              {t('summary.promoApply')}
            </button>
          </div>

          {/* Totaux */}
          <div className="mt-4 space-y-2 text-sm text-muted">
            <div className="flex justify-between">
              <span>{t('summary.subtotal')}</span>
              <span className="text-ink">{formatPrice(sub)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                Livraison
                {shippingZone && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                    {shippingZone.carrier}
                  </span>
                )}
              </span>
              {loadingZone ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted" />
              ) : shippingIsFree ? (
                <span className="text-green-600 font-semibold">Gratuit</span>
              ) : (
                <span className="text-ink">{formatPrice(shippingFee)}</span>
              )}
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sale font-medium">
                <span>{t('summary.discount', { code: promo?.code })}</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink border-t border-line pt-2 text-base">
              <span>{t('summary.total')}</span>
              <span>{formatPrice(totalEur)}</span>
            </div>
          </div>

          <button
            className="btn-primary mt-6 w-full rounded-xl py-3 font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loadingSession || loadingZone || (!shippingZone && !loadingZone)}
            data-testid="place-order"
          >
            {loadingSession ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initialisation…
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
