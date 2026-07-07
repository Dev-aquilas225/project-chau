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
  const { user, sellerStatus } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [expandedTopId, setExpandedTopId] = useState<string | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [hoveredTopId, setHoveredTopId] = useState<string | null>(null);

  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';
  const topCategories = categories?.filter((c) => !c.parentId) ?? [];
  const childrenOf = (id: string) => categories?.filter((c) => c.parentId === id) ?? [];

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setExpandedTopId(null);
    setExpandedSubId(null);
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

        {user ? (
          <>
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
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              <Link to="/panier" className="relative" aria-label={t('header.cart')} data-testid="cart-link">
                <ShoppingBag />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={submitSearch} className="hidden flex-1 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="w-full rounded-full bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none"
                  placeholder={t('header.searchPlaceholder')}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  data-testid="search-input"
                />
              </div>
            </form>

            <Link to="/" className="brand-logo min-w-0 shrink text-base sm:text-xl md:text-2xl">Occasion de luxe PJ international</Link>

            <div className="flex shrink-0 items-center gap-3 sm:gap-6 md:flex-1 md:justify-end">
              <Link to={sellerLink} className="btn-primary hidden px-5 py-2 text-sm md:inline-flex">
                {t('header.sell')}
              </Link>
              <Link to="/login" className="hidden text-sm font-medium hover:underline md:inline">
                {t('header.login')}
              </Link>
              <Link to="/register" className="hidden text-sm font-medium hover:underline md:inline">
                {t('header.register')}
              </Link>
              <Link to="/panier" className="relative" aria-label={t('header.cart')} data-testid="cart-link">
                <ShoppingBag />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Catégories desktop (mega-menu) */}
      <nav
        className="relative hidden border-t border-line md:block"
        onMouseLeave={() => setHoveredTopId(null)}
      >
        <div className="container-app flex gap-6 overflow-x-auto py-2 text-sm no-scrollbar">
          <Link to="/catalogue" className="whitespace-nowrap hover:underline">{t('header.all')}</Link>
          {topCategories.map((top) => (
            <Link
              key={top.id}
              to={`/catalogue?category=${top.id}`}
              className={cn('whitespace-nowrap hover:underline', hoveredTopId === top.id && 'underline')}
              onMouseEnter={() => setHoveredTopId(top.id)}
              onFocus={() => setHoveredTopId(top.id)}
            >
              {top.name}
            </Link>
          ))}
        </div>

        {hoveredTopId && childrenOf(hoveredTopId).length > 0 && (
          <div className="absolute inset-x-0 top-full z-30 border-t border-line bg-paper shadow-lg">
            <div className="container-app grid grid-cols-4 gap-x-8 gap-y-6 py-6">
              {childrenOf(hoveredTopId).map((sub) => (
                <div key={sub.id}>
                  <Link
                    to={`/catalogue?category=${sub.id}`}
                    onClick={() => setHoveredTopId(null)}
                    className="mb-3 block text-sm font-semibold hover:underline"
                  >
                    {sub.name}
                  </Link>
                  <ul className="space-y-2">
                    {childrenOf(sub.id).map((type) => (
                      <li key={type.id}>
                        <Link
                          to={`/catalogue?category=${type.id}`}
                          onClick={() => setHoveredTopId(null)}
                          className="text-sm text-muted hover:text-ink hover:underline"
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
            {topCategories.map((top) => {
              const subs = childrenOf(top.id);
              const isTopExpanded = expandedTopId === top.id;
              return (
                <div key={top.id} className="border-b border-line">
                  {subs.length > 0 ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-4 text-left text-base font-medium"
                      onClick={() => {
                        setExpandedTopId(isTopExpanded ? null : top.id);
                        setExpandedSubId(null);
                      }}
                    >
                      {top.name}
                      <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', isTopExpanded && 'rotate-180')} />
                    </button>
                  ) : (
                    <Link to={`/catalogue?category=${top.id}`} onClick={closeMenu} className="flex items-center justify-between px-4 py-4 text-base font-medium">
                      {top.name}
                    </Link>
                  )}
                  {isTopExpanded && (
                    <div className="bg-gray-50 pb-2">
                      <Link to={`/catalogue?category=${top.id}`} onClick={closeMenu} className="block px-6 py-2 text-sm font-semibold">
                        {t('header.viewAllIn', { name: top.name })}
                      </Link>
                      {subs.map((sub) => {
                        const types = childrenOf(sub.id);
                        const isSubExpanded = expandedSubId === sub.id;
                        return (
                          <div key={sub.id}>
                            {types.length > 0 ? (
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-6 py-2 text-left text-sm font-medium"
                                onClick={() => setExpandedSubId(isSubExpanded ? null : sub.id)}
                              >
                                {sub.name}
                                <ChevronDown className={cn('h-3.5 w-3.5 text-muted transition-transform', isSubExpanded && 'rotate-180')} />
                              </button>
                            ) : (
                              <Link to={`/catalogue?category=${sub.id}`} onClick={closeMenu} className="block px-6 py-2 text-sm font-medium">
                                {sub.name}
                              </Link>
                            )}
                            {isSubExpanded && (
                              <div className="bg-gray-100 pb-1">
                                <Link to={`/catalogue?category=${sub.id}`} onClick={closeMenu} className="block px-8 py-1.5 text-xs font-semibold">
                                  {t('header.viewAllIn', { name: sub.name })}
                                </Link>
                                {types.map((type) => (
                                  <Link key={type.id} to={`/catalogue?category=${type.id}`} onClick={closeMenu} className="block px-8 py-1.5 text-xs">
                                    {type.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 border-t border-line p-4">
            {!user && (
              <div className="flex gap-3">
                <Link to="/login" onClick={closeMenu} className="btn-outline flex-1 text-center text-sm">
                  {t('header.login')}
                </Link>
                <Link to="/register" onClick={closeMenu} className="btn-primary flex-1 text-center text-sm">
                  {t('header.register')}
                </Link>
              </div>
            )}
            <Link to={sellerLink} onClick={closeMenu} className="btn-primary px-5 py-2 text-center text-sm">
              {t('header.sell')}
            </Link>
            <LanguageSelector />
          </div>
        </div>
      )}
    </header>
  );
}
