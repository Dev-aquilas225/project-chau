import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CreditCard, Tag } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCartStore } from '@/stores/cartStore';
import { useCreateOrder } from '@/features/orders/hooks';
import { validatePromo } from '@/features/orders/api';
import type { PromoValidationResult } from '@/types';
import { formatPrice } from '@/lib/utils';
import { LegalNotice } from '@/components/LegalNotice';

interface AddressForm {
  fullName: string; line1: string; city: string; zip: string; country: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('checkout');
  const { user, profile } = useAuth();
  const { items, subtotal, clear } = useCartStore();
  const createOrder = useCreateOrder();
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    defaultValues: { fullName: profile?.displayName, country: 'France' },
  });

  const [promo, setPromo] = useState<PromoValidationResult | null>(null);
  const [code, setCode] = useState('');
  const [payment, setPayment] = useState('card');

  const sub = subtotal();
  const discount = promo?.discount ?? 0;
  const total = promo?.total ?? Math.max(0, sub - discount);

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
    try {
      // Paiement simulé (la monétique réelle nécessite un backend/Cloud Function + PSP)
      await new Promise((r) => setTimeout(r, 600));
      const orderId = await createOrder.mutateAsync({
        items: items.map((i) => ({ productId: i.productId, name: i.name, brand: i.brand, image: i.image, unitPrice: i.unitPrice, qty: i.qty })),
        subtotal: sub,
        discount,
        total,
        promoCode: promo?.code,
        shippingAddress: address,
        paymentMethod: payment,
      });
      clear();
      toast.success(t('toasts.orderConfirmed'));
      navigate(`/commandes?last=${orderId}`);
    } catch {
      toast.error(t('toasts.paymentFailed'));
    }
  };

  const paymentMethods = [
    { id: 'card', label: t('payment.card') },
    { id: 'paypal', label: t('payment.paypal') },
    { id: 'klarna', label: t('payment.klarna') },
  ];

  return (
    <div className="container-app py-6">
      <h1 className="mb-6 text-2xl">{t('title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Adresse */}
          <section>
            <h2 className="mb-3 text-lg">{t('address.sectionTitle')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input sm:col-span-2" placeholder={t('address.fullNamePlaceholder')} {...register('fullName', { required: true })} />
              <input className="input sm:col-span-2" placeholder={t('address.line1Placeholder')} {...register('line1', { required: true })} />
              <input className="input" placeholder={t('address.cityPlaceholder')} {...register('city', { required: true })} />
              <input className="input" placeholder={t('address.zipPlaceholder')} {...register('zip', { required: true })} />
              <input className="input sm:col-span-2" placeholder={t('address.countryPlaceholder')} {...register('country', { required: true })} />
            </div>
            {Object.keys(errors).length > 0 && <p className="mt-2 text-xs text-sale">{t('address.requiredError')}</p>}
          </section>

          {/* Paiement (simulé) */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5" /> {t('payment.sectionTitle')}</h2>
            <div className="space-y-2">
              {paymentMethods.map((m) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-line p-3 text-sm">
                  <input type="radio" name="payment" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                  {m.label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{t('payment.simulatedNote')}</p>
          </section>

          <LegalNotice />
        </div>

        {/* Récap */}
        <aside className="h-fit rounded-lg border border-line p-5">
          <h2 className="mb-3 text-lg">{t('summary.title')}</h2>
          <ul className="mb-3 max-h-40 space-y-1 overflow-auto text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between">
                <span className="truncate">{i.brand} ×{i.qty}</span>
                <span>{formatPrice(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input className="input pl-9" placeholder={t('summary.promoPlaceholder')} value={code} onChange={(e) => setCode(e.target.value)} data-testid="promo-input" />
            </div>
            <button type="button" className="btn-outline px-4" onClick={applyPromo}>{t('summary.promoApply')}</button>
          </div>

          <div className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span>{t('summary.subtotal')}</span><span>{formatPrice(sub)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sale"><span>{t('summary.discount', { code: promo?.code })}</span><span>−{formatPrice(discount)}</span></div>}
            <div className="flex justify-between font-semibold"><span>{t('summary.total')}</span><span>{formatPrice(total)}</span></div>
          </div>

          <button className="btn-primary mt-5 w-full" disabled={createOrder.isPending} data-testid="place-order">
            {createOrder.isPending ? t('summary.processing') : t('summary.payButton', { amount: formatPrice(total) })}
          </button>
        </aside>
      </form>
    </div>
  );
}
