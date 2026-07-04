import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { logout } from '@/features/auth/api';
import { useClickOutside } from '@/hooks/useClickOutside';
import { getInitials } from '@/lib/utils';

export function AccountMenu() {
  const { t } = useTranslation('common');
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  if (!user) {
    return (
      <Link to="/login" className="text-sm font-medium hover:underline">
        {t('accountMenu.login')}
      </Link>
    );
  }

  const handleLogout = async () => {
    await logout();
    await refresh();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={t('accountMenu.ariaLabel')}
        data-testid="account-menu-trigger"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-bold text-paper"
        onClick={() => setOpen((v) => !v)}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={t('accountMenu.photoAlt')} className="h-full w-full object-cover" />
        ) : (
          getInitials(user.displayName)
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-line bg-paper shadow-lg">
          <Link to="/compte" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
            {t('accountMenu.myAccount')}
          </Link>
          <Link to="/commandes" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
            {t('accountMenu.myOrders')}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full border-t border-line px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            {t('accountMenu.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
