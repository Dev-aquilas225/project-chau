import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useCategories } from '@/features/catalog/hooks';
import { useAuth } from '@/features/auth/AuthProvider';

export function Header() {
  const navigate = useNavigate();
  const count = useCartStore((s) => s.totalQty());
  const { data: categories } = useCategories();
  const { sellerStatus } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/catalogue?search=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="container-app flex items-center justify-between gap-4 py-3">
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
        <Link to="/" className="brand-logo text-xl md:text-2xl">Occasion de luxe PJ international</Link>

        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher une marque, un article…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="search-input"
            />
          </div>
        </form>

        <Link to={sellerLink} className="hidden text-sm font-medium hover:underline md:block">
          Vendre
        </Link>
        <Link to="/panier" className="relative" aria-label="Panier" data-testid="cart-link">
          <ShoppingBag />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Catégories desktop */}
      <nav className="hidden border-t border-line md:block">
        <div className="container-app flex gap-6 overflow-x-auto py-2 text-sm no-scrollbar">
          <Link to="/catalogue" className="whitespace-nowrap hover:underline">Tout</Link>
          {categories?.map((c) => (
            <Link key={c.id} to={`/catalogue?category=${c.id}`} className="whitespace-nowrap hover:underline">
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-line p-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <input className="input" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/catalogue" onClick={() => setOpen(false)}>Tout</Link>
            {categories?.map((c) => (
              <Link key={c.id} to={`/catalogue?category=${c.id}`} onClick={() => setOpen(false)}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
