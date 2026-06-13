import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Boxes, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produits', label: 'Produits', icon: Package },
  { to: '/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/stock', label: 'Stock', icon: Boxes },
];

interface BottomNavProps {
  onMore: () => void;
}

export function BottomNav({ onMore }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={`bottom-nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-ink' : 'text-muted')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onMore}
          aria-label="Plus d'options"
          data-testid="bottom-nav-more"
          className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted"
        >
          <Menu className="h-5 w-5" />
          Plus
        </button>
      </div>
    </nav>
  );
}
