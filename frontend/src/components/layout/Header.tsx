import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCategories } from '@/features/catalog/hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';
import { cn } from '@/lib/utils';
import { AccountMenu } from './AccountMenu';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';

export function Header() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const count = useCartStore((s) => s.totalQty());
  const favoritesCount = useFavoritesStore((s) => s.ids.length);
  const { data: categories } = useCategories();
  const { user, sellerStatus } = useAuth();
  const [q, setQ] = useState('');
  const [hoveredTopId, setHoveredTopId] = useState<string | null>(null);

  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';
  const topCategories = categories?.filter((c) => !c.parentId) ?? [];
  const childrenOf = (id: string) => categories?.filter((c) => c.parentId === id) ?? [];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/catalogue?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">

      {/* ── Top utility bar ──────────────────────────────────────────── */}
      <div className="border-b border-gray-100 py-2 hidden md:block">
        <div className="container-custom flex justify-between items-center">
          <p className="text-[10px] uppercase tracking-widest text-luxury-muted">
            Livraison Gratuite sur les Commandes de Plus de 500€
          </p>
          <div className="flex gap-6">
            <Link to="/aide" className="text-[10px] uppercase tracking-widest text-luxury-muted hover:text-luxury-dark transition-colors">
              Aide
            </Link>
            <Link to="/commandes" className="text-[10px] uppercase tracking-widest text-luxury-muted hover:text-luxury-dark transition-colors">
              Suivi de commande
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <span className="text-gray-200">|</span>
              <CurrencySelector />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────────────── */}
      <div className="container-custom py-5">
        <div className="flex items-center justify-between gap-4">

          {/* Left: search (desktop only) */}
          <div className="flex-1 hidden lg:flex">
            <form onSubmit={submitSearch} className="relative w-64">
              <input
                className="w-full border-none bg-luxury-beige py-2.5 pl-4 pr-10 text-sm focus:ring-0 focus:outline-none placeholder:text-luxury-muted"
                placeholder={t('header.searchPlaceholder')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                data-testid="search-input"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-luxury-muted" />
              </button>
            </form>
          </div>

          {/* Center: logo */}
          <div className="flex-1 text-center">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="PJ International — Occasion de Luxe"
                className="mx-auto h-12 w-auto md:h-14 lg:h-16"
              />
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6">
            <Link
              to={sellerLink}
              className="text-xs font-medium uppercase tracking-widest hover:text-luxury-gold transition-colors hidden md:block"
            >
              {t('header.sell')}
            </Link>
            <div className="h-4 w-px bg-gray-200 hidden md:block" />
            {user ? (
              <>
                <NotificationsBell />
                <Link
                  to="/favoris"
                  className="relative hidden md:block"
                  aria-label={t('header.favorites')}
                  data-testid="favorites-link"
                >
                  <Heart className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 bg-luxury-dark text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <AccountMenu />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium uppercase tracking-widest hover:text-luxury-gold transition-colors hidden md:block"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden md:block"
                  aria-label="Créer un compte"
                >
                  <User className="h-5 w-5 hover:text-luxury-gold transition-colors" />
                </Link>
              </>
            )}
            <Link
              to="/panier"
              className="relative"
              aria-label={t('header.cart')}
              data-testid="cart-link"
            >
              <ShoppingBag className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 bg-luxury-dark text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category nav (desktop) ───────────────────────────────────── */}
      <nav
        className="relative hidden lg:block border-t border-gray-100"
        onMouseLeave={() => setHoveredTopId(null)}
      >
        <div className="container-custom py-3">
          <ul className="flex justify-center gap-10 text-xs uppercase tracking-[0.2em] font-medium">
            <li>
              <Link
                to="/catalogue"
                className="hover:text-luxury-gold transition-colors"
                onMouseEnter={() => setHoveredTopId(null)}
              >
                {t('header.all')}
              </Link>
            </li>
            {topCategories.map((top) => (
              <li key={top.id}>
                <Link
                  to={`/catalogue?category=${top.id}`}
                  className={cn(
                    'hover:text-luxury-gold transition-colors',
                    hoveredTopId === top.id && 'text-luxury-gold'
                  )}
                  onMouseEnter={() => setHoveredTopId(top.id)}
                >
                  {top.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mega-menu dropdown */}
        {hoveredTopId && childrenOf(hoveredTopId).length > 0 && (
          <div className="absolute inset-x-0 top-full z-30 border-t border-line bg-white shadow-xl">
            <div className="container-custom grid grid-cols-4 gap-x-8 gap-y-6 py-8">
              {childrenOf(hoveredTopId).map((sub) => (
                <div key={sub.id}>
                  <Link
                    to={`/catalogue?category=${sub.id}`}
                    onClick={() => setHoveredTopId(null)}
                    className="mb-3 block text-xs font-semibold uppercase tracking-widest hover:text-luxury-gold transition-colors"
                  >
                    {sub.name}
                  </Link>
                  <ul className="space-y-2">
                    {childrenOf(sub.id).map((type) => (
                      <li key={type.id}>
                        <Link
                          to={`/catalogue?category=${type.id}`}
                          onClick={() => setHoveredTopId(null)}
                          className="text-sm text-luxury-muted hover:text-luxury-dark transition-colors"
                        >
                          {type.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

    </header>
  );
}
