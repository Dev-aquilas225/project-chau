import { NavLink } from 'react-router-dom';
import { Home, Heart, CirclePlus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';

export function BottomNav() {
  const { t } = useTranslation('common');
  const { sellerStatus } = useAuth();
  const sellerLink = sellerStatus === 'approved' ? '/espace-vendeur' : '/devenir-vendeur';

  const items = [
    { to: '/', label: t('bottomNav.home'), icon: Home, end: true },
    { to: '/favoris', label: t('bottomNav.favorites'), icon: Heart },
    { to: sellerLink, label: t('bottomNav.sell'), icon: CirclePlus },
  ];
  const lastItems = [{ to: '/compte', label: t('bottomNav.me'), icon: User, end: false }];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper md:hidden">
      <div className="flex items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-ink' : 'text-muted')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        <NotificationsBell variant="bottomNav" label={t('bottomNav.notifications')} />
        {lastItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-ink' : 'text-muted')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
