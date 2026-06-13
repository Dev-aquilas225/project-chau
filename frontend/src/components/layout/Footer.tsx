import { LegalNotice } from '@/components/LegalNotice';

const sections = ['Nos services', 'Acheter', 'Vendre', 'Aide', 'Occasion de luxe PJ international'];

const payments = [
  { name: 'PayPal', slug: 'paypal' },
  { name: 'Visa', slug: 'visa' },
  { name: 'American Express', slug: 'americanexpress' },
  { name: 'Mastercard', slug: 'mastercard' },
  { name: 'UnionPay', slug: 'unionpay' },
  { name: 'Klarna', slug: 'klarna' },
];

export function Footer() {
  return (
    <footer className="mt-12 bg-ink text-paper">
      <div className="container-app py-8">
        <ul className="divide-y divide-white/10">
          {sections.map((s) => (
            <li key={s} className="flex items-center justify-between py-4 text-sm font-semibold uppercase tracking-wide">
              {s} <span className="text-white/50">+</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2">
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

        <div className="mt-8">
          <LegalNotice className="border-amber-300/40 bg-white/5 text-white/70" />
        </div>

        <p className="mt-8 text-center text-xs text-white/50">©{new Date().getFullYear()} Occasion de luxe PJ international</p>
      </div>
    </footer>
  );
}
