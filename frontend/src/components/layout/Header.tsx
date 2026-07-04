import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCategories } from '@/features/catalog/hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';
import { AccountMenu } from './AccountMenu';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const count = useCartStore((s) => s.totalQty());
  const favoritesCount = useFavoritesStore((s) => s.ids.length);
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
      <div className="container-app flex items-center justify-between gap-2 py-3 sm:gap-4">
        <button className="shrink-0 md:hidden" aria-label={t('header.menu')} onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
        <Link to="/" className="brand-logo min-w-0 shrink text-base sm:text-xl md:text-2xl">Occasion de luxe PJ international</Link>

        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder={t('header.searchPlaceholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="search-input"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <NotificationsBell />
          <Link to="/favoris" className="relative" aria-label={t('header.favorites')} data-testid="favorites-link">
            <Heart />
            {favoritesCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
                {favoritesCount}
              </span>
            )}
          </Link>
          <AccountMenu />
          <Link to={sellerLink} className="btn-primary hidden px-5 py-2 text-sm md:inline-flex">
            {t('header.sell')}
          </Link>
          <LanguageSelector />
          <Link to="/panier" className="relative" aria-label={t('header.cart')} data-testid="cart-link">
            <ShoppingBag />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Catégories desktop */}
      <nav className="hidden border-t border-line md:block">
        <div className="container-app flex gap-6 overflow-x-auto py-2 text-sm no-scrollbar">
          <Link to="/catalogue" className="whitespace-nowrap hover:underline">{t('header.all')}</Link>
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
            <input className="input" placeholder={t('header.searchPlaceholderMobile')} value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/catalogue" onClick={() => setOpen(false)}>{t('header.all')}</Link>
            {categories?.map((c) => (
              <Link key={c.id} to={`/catalogue?category=${c.id}`} onClick={() => setOpen(false)}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
