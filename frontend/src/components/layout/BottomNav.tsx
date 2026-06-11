import { NavLink } from 'react-router-dom';
import { Home, Heart, ShoppingBag, Package, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';

const items = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/favoris', label: 'Favoris', icon: Heart },
  { to: '/panier', label: 'Panier', icon: ShoppingBag },
  { to: '/commandes', label: 'Commandes', icon: Package },
  { to: '/compte', label: 'Moi', icon: User },
];

export function BottomNav() {
  const count = useCartStore((s) => s.totalQty());
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
