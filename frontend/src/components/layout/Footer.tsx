import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { LegalNotice } from '@/components/LegalNotice';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/utils';

const payments = [
  { name: 'PayPal', slug: 'paypal' },
  { name: 'Visa', slug: 'visa' },
  { name: 'American Express', slug: 'americanexpress' },
  { name: 'Mastercard', slug: 'mastercard' },
  { name: 'UnionPay', slug: 'unionpay' },
  { name: 'Klarna', slug: 'klarna' },
];

export function Footer() {
  const { t } = useTranslation('common');
  const { sellerStatus } = useAuth();
  const sectionTitles = t('footer.sections', { returnObjects: true }) as string[];
  const [expanded, setExpanded] = useState<number | null>(null);
  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';

  // Sous-liens par section, mappés sur les pages réellement disponibles dans l'appli
  // (index aligné sur footer.sections ; les sections sans entrée ici restent statiques : pas de
  // page "aide"/"notre concept" dans l'app pour l'instant).
  const sectionLinks: { to: string; label: string }[][] = [
    [],
    [
      { to: '/catalogue', label: t('header.all') },
      { to: '/favoris', label: t('header.favorites') },
      { to: '/panier', label: t('header.cart') },
      { to: '/commandes', label: t('accountMenu.myOrders') },
    ],
    [{ to: sellerLink, label: t('header.sell') }],
    [],
    [],
  ];

  return (
    <footer className="mt-12 bg-ink text-paper">
      <div className="container-app py-8">
        <ul className="divide-y divide-white/10 md:grid md:grid-cols-5 md:gap-8 md:divide-y-0">
          {sectionTitles.map((title, i) => {
            const links = sectionLinks[i];
            const isExpandable = !!links?.length;
            const isOpen = expanded === i;
            return (
              <li key={title}>
                {isExpandable ? (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-wide md:pointer-events-none md:py-0"
                    onClick={() => setExpanded(isOpen ? null : i)}
                  >
                    {title}
                    <ChevronDown className={cn('h-4 w-4 text-white/50 transition-transform md:hidden', isOpen && 'rotate-180')} />
                  </button>
                ) : (
                  <div className="py-4 text-sm font-semibold uppercase tracking-wide md:py-0">{title}</div>
                )}
                {isExpandable && (
                  <div className={cn('pb-4 md:!block md:pt-4', isOpen ? 'block' : 'hidden')}>
                    {links!.map((l) => (
                      <Link key={l.to} to={l.to} className="block py-2 text-sm text-white/70 hover:text-white md:py-1.5">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <LanguageSelector />
          <div className="flex flex-wrap gap-2">
            {payments.map((p) => (
              <span key={p.slug} className="flex h-7 items-center rounded bg-white px-2">
                <img
                  src={`https://cdn.simpleicons.org/${p.slug}`}
                  alt={p.name}
                  title={p.name}
                  className="h-4 w-auto"
                  loading="lazy"
                />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <LegalNotice className="border-amber-300/40 bg-white/5 text-white/70" />
        </div>

        <p className="mt-8 text-center text-xs text-white/50">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
