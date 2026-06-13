import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Users, Tag, CreditCard, LogOut, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, adminLogout } from '@/features/auth/AuthProvider';

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/produits', label: 'Produits', icon: Package },
  { to: '/stock', label: 'Stock', icon: Boxes },
  { to: '/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/promotions', label: 'Promotions', icon: Tag },
  { to: '/paiements', label: 'Paiements', icon: CreditCard },
];

export function AdminLayout() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <>
      <div className="px-6 py-5">
        <p className="brand-logo text-xl text-paper">Occasion de luxe PJ international</p>
        <p className="text-xs text-white/50">Back-office</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm', isActive ? 'bg-white/15 text-paper' : 'text-white/70 hover:bg-white/5')
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <p className="px-3 py-1 text-xs text-white/50">{profile?.email}</p>
        <button onClick={() => adminLogout().then(() => window.location.assign('/login'))} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 flex-col bg-admin md:flex">{SidebarContent}</aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-60 flex-col bg-admin">{SidebarContent}</aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button>
          <span className="brand-logo">Occasion de luxe PJ international</span>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
