import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCategories } from '@/features/catalog/hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';
import { cn } from '@/lib/utils';
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
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';
  const topCategories = categories?.filter((c) => !c.parentId) ?? [];
  const childrenOf = (id: string) => categories?.filter((c) => c.parentId === id) ?? [];

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setExpandedCategoryId(null);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/catalogue?search=${encodeURIComponent(q)}`);
    closeMenu();
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

      {/* Menu mobile plein écran */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper md:hidden">
          <div className="flex items-center justify-between border-b border-line p-4">
            <span className="brand-logo text-xl">Occasion de luxe PJ international</span>
            <button type="button" aria-label={t('header.close')} onClick={closeMenu}>
              <X />
            </button>
          </div>

          <form onSubmit={submitSearch} className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="w-full rounded-lg bg-gray-100 py-3 pl-9 pr-3 text-sm outline-none"
                placeholder={t('header.searchPlaceholderMobile')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </form>

          <nav className="flex-1 overflow-y-auto">
            <Link
              to="/catalogue"
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-line px-4 py-4 text-base"
            >
              {t('header.all')}
            </Link>
            {topCategories.map((c) => {
              const children = childrenOf(c.id);
              const isExpanded = expandedCategoryId === c.id;
              return (
                <div key={c.id} className="border-b border-line">
                  {children.length > 0 ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-4 text-left text-base"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : c.id)}
                    >
                      {c.name}
                      <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                  ) : (
                    <Link to={`/catalogue?category=${c.id}`} onClick={closeMenu} className="flex items-center justify-between px-4 py-4 text-base">
                      {c.name}
                    </Link>
                  )}
                  {isExpanded && (
                    <div className="bg-gray-50 pb-2">
                      <Link to={`/catalogue?category=${c.id}`} onClick={closeMenu} className="block px-8 py-2 text-sm font-medium">
                        {t('header.viewAllIn', { name: c.name })}
                      </Link>
                      {children.map((child) => (
                        <Link key={child.id} to={`/catalogue?category=${child.id}`} onClick={closeMenu} className="block px-8 py-2 text-sm">
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
