import { NavLink } from 'react-router-dom';
import { Home, Heart, ShoppingBag, Package, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';

export function BottomNav() {
  const { t } = useTranslation('common');
  const count = useCartStore((s) => s.totalQty());

  const items = [
    { to: '/', label: t('bottomNav.home'), icon: Home, end: true },
    { to: '/favoris', label: t('bottomNav.favorites'), icon: Heart },
    { to: '/panier', label: t('bottomNav.cart'), icon: ShoppingBag },
    { to: '/commandes', label: t('bottomNav.orders'), icon: Package },
    { to: '/compte', label: t('bottomNav.me'), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-ink' : 'text-muted')
            }
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {to === '/panier' && count > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-paper">
                  {count}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
