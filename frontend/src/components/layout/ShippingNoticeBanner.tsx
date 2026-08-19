import { useEffect, useState } from 'react';
import { Package, X } from 'lucide-react';

const DISMISS_KEY = 'shipping-notice-dismissed';
const ROTATE_MS = 6000;

const MESSAGES = [
  <>
    <span className="font-semibold uppercase tracking-wide text-luxury-gold">Organisation des envois — </span>
    Afin de maintenir une logistique optimale, <strong className="font-semibold">un seul envoi est effectué par semaine, chaque lundi</strong>.
    {' '}Toute commande passée <strong className="font-semibold">le lundi après 11h00</strong> sera automatiquement expédiée{' '}
    <strong className="font-semibold">le lundi de la semaine suivante</strong>. Nous vous remercions pour votre compréhension et votre confiance.
  </>,
  <>
    <span className="font-semibold uppercase tracking-wide text-luxury-gold">Marketplace — </span>
    Les produits publiés par nos <strong className="font-semibold">vendeurs partenaires</strong> le sont sous leur seule responsabilité.
    {' '}Ni Occasion de luxe PJ international ni la plateforme <strong className="font-semibold">n'engagent leur responsabilité sur la qualité de ces produits</strong>,
    {' '}ni sur le <strong className="font-semibold">délai de livraison</strong> indiqué au panier.
  </>,
];

export function ShippingNoticeBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [dismissed]);

  if (dismissed) return null;

  const close = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="bg-luxury-dark text-white">
      <div className="container-custom flex items-start gap-3 py-3 text-center sm:items-center sm:justify-center sm:text-left">
        <Package className="mt-0.5 h-4 w-4 shrink-0 text-luxury-gold sm:mt-0" />
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: '2.5em' }}>
          {MESSAGES.map((message, i) => (
            <p
              key={i}
              aria-hidden={i !== index}
              className="absolute inset-0 text-xs leading-relaxed transition-opacity duration-700 ease-in-out sm:text-sm"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              {message}
            </p>
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {MESSAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-luxury-gold' : 'bg-white/30'}`}
            />
          ))}
        </div>
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
