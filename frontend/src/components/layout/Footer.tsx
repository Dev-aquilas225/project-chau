import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import { LegalNotice } from '@/components/LegalNotice';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/utils';

const PAYMENT_BRANDS = [
  { name: 'Visa', bg: '#1A1F71', text: '#fff', abbr: 'VISA' },
  { name: 'Mastercard', bg: '#eb001b', text: '#fff', abbr: 'MC' },
  { name: 'Amex', bg: '#007bc1', text: '#fff', abbr: 'AMEX' },
  { name: 'PayPal', bg: '#003087', text: '#fff', abbr: 'PP' },
  { name: 'Stripe', bg: '#635bff', text: '#fff', abbr: 'S' },
];

export function Footer() {
  const { t } = useTranslation('common');
  const { sellerStatus } = useAuth();
  const [expanded, setExpanded] = useState<number | null>(null);
  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';

  const sections = [
    {
      title: 'Nos Services',
      links: [
        { to: '/aide', label: 'Conciergerie' },
        { to: '/authenticite', label: "Expertise d'Authenticité" },
        { to: '/retours', label: 'Nettoyage & Restauration' },
        { to: '/contact', label: 'Carte Cadeau' },
      ],
    },
    {
      title: 'Acheter & Vendre',
      links: [
        { to: '/comment-vendre', label: 'Comment vendre ?' },
        { to: '/conseils-vente', label: 'Nos conseils pour vendre' },
        { to: '/retours', label: 'Politique de retours' },
        { to: '/vendeurs-professionnels', label: 'Vendeurs professionnels' },
      ],
    },
    {
      title: 'Aide',
      links: [
        { to: '/aide', label: "Centre d'aide" },
        { to: '/contact', label: 'Nous contacter' },
        { to: '/livraison', label: 'Livraison & Frais' },
        { to: '/newsletter', label: 'Newsletter' },
      ],
    },
  ];

  return (
    <footer className="bg-luxury-dark text-white">
      <div className="container-custom pt-16 pb-10">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">

          {/* Brand column */}
          <div>
            <div className="font-serif text-xl mb-6 tracking-tight">
              OCCASION DE LUXE PJ
            </div>
            <p className="text-gray-400 text-xs leading-loose tracking-wide">
              Votre destination de confiance pour le luxe de seconde main.
              Authenticité garantie, passion partagée.
            </p>
            <div className="mt-6">
              <Link
                to={sellerLink}
                className="inline-block border border-luxury-gold text-luxury-gold px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] hover:bg-luxury-gold hover:text-white transition-luxury"
              >
                Vendre un article
              </Link>
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section, i) => {
            const isOpen = expanded === i;
            return (
              <div key={section.title}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between mb-4 md:pointer-events-none"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-luxury-gold">
                    {section.title}
                  </h4>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-gray-500 transition-transform md:hidden',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <ul className={cn('space-y-3', !isOpen && 'hidden md:block')}>
                  {section.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-xs text-gray-400 hover:text-white transition-colors leading-relaxed"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

          {/* Left: language + payments */}
          <div className="flex flex-wrap items-center gap-4">
            <LanguageSelector />
            <div className="flex gap-2">
              {PAYMENT_BRANDS.map((p) => (
                <span
                  key={p.name}
                  title={p.name}
                  className="flex h-6 w-10 items-center justify-center rounded text-[9px] font-bold tracking-wider"
                  style={{ backgroundColor: p.bg, color: p.text }}
                >
                  {p.abbr}
                </span>
              ))}
            </div>
          </div>

          {/* Right: legal disclaimer */}
          <div className="max-w-md border border-gray-700 p-4 bg-white/5 rounded">
            <div className="flex gap-3 items-start">
              <ShieldAlert className="w-4 h-4 text-luxury-gold mt-0.5 shrink-0" />
              <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-tight">
                Le fait de vendre comme de porter de la contrefaçon est un délit pénal passible
                d'une peine de 3 ans d'emprisonnement et 300.000 € d'amende.
                Nous nous engageons pour l'authenticité de chaque pièce.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} OCCASION DE LUXE PJ INTERNATIONAL
          </p>
        </div>
      </div>
    </footer>
  );
}
