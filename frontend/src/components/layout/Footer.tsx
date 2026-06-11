const sections = ['Nos services', 'Acheter', 'Vendre', 'Aide', 'Aquilas'];
const payments = ['PayPal', 'VISA', 'AMEX', 'Mastercard', 'UnionPay', 'Klarna'];

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
            <span key={p} className="rounded bg-white px-2 py-1 text-[11px] font-bold text-ink">{p}</span>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/50">©{new Date().getFullYear()} Aquilas Collective</p>
      </div>
    </footer>
  );
}
