import { useState } from 'react';
import { Package, X } from 'lucide-react';

const DISMISS_KEY = 'shipping-notice-dismissed';

export function ShippingNoticeBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  if (dismissed) return null;

  const close = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="bg-luxury-dark text-white">
      <div className="container-custom flex items-start gap-3 py-3 text-center sm:items-center sm:justify-center sm:text-left">
        <Package className="mt-0.5 h-4 w-4 shrink-0 text-luxury-gold sm:mt-0" />
        <p className="flex-1 text-xs leading-relaxed sm:text-sm">
          <span className="font-semibold uppercase tracking-wide text-luxury-gold">Organisation des envois — </span>
          Afin de maintenir une logistique optimale, <strong className="font-semibold">un seul envoi est effectué par semaine, chaque lundi</strong>.
          {' '}Toute commande passée <strong className="font-semibold">le lundi après 11h00</strong> sera automatiquement expédiée{' '}
          <strong className="font-semibold">le lundi de la semaine suivante</strong>. Nous vous remercions pour votre compréhension et votre confiance.
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="shrink-0 text-white/60 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
