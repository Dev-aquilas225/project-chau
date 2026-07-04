import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn, formatDate } from '@/lib/utils';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from './hooks';

interface NotificationsBellProps {
  /** 'header' (default) ouvre le panneau vers le bas ; 'bottomNav' l'ouvre vers le haut et affiche un libellé sous l'icône. */
  variant?: 'header' | 'bottomNav';
  label?: string;
}

export function NotificationsBell({ variant = 'header', label }: NotificationsBellProps) {
  const { t } = useTranslation('notifications');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications(user?.id);
  const { data: unread } = useUnreadCount(user?.id);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  useClickOutside(ref, () => setOpen(false), open);

  if (!user) return null;

  const count = unread?.count ?? 0;
  const isBottomNav = variant === 'bottomNav';

  const onNotificationClick = (id: string, read: boolean, link?: string | null) => {
    if (!read) markAsRead.mutate(id);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className={cn('relative', isBottomNav && 'flex flex-1 justify-center')} ref={ref}>
      <button
        type="button"
        className={cn('relative', isBottomNav && 'flex w-full flex-col items-center gap-0.5 py-2 text-[11px] text-muted')}
        aria-label={t('ariaLabel')}
        data-testid="notifications-bell"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative">
          <Bell className={isBottomNav ? 'h-5 w-5' : undefined} />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
              {count}
            </span>
          )}
        </span>
        {isBottomNav && label}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 z-50 w-80 max-w-[90vw] rounded-lg border border-line bg-paper shadow-lg',
            isBottomNav ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          <div className="flex items-center justify-between border-b border-line p-3">
            <span className="text-sm font-medium">{t('title')}</span>
            {count > 0 && (
              <button
                type="button"
                className="text-xs text-muted hover:underline"
                onClick={() => markAllAsRead.mutate()}
              >
                {t('markAllAsRead')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted">{t('empty')}</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onNotificationClick(n.id, n.read, n.link)}
                  className="flex w-full items-start gap-2 border-b border-line p-3 text-left last:border-b-0 hover:bg-gray-50"
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink" />}
                  <div className={n.read ? 'ml-4' : ''}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(new Date(n.createdAt))}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
