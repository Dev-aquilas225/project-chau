import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { useClickOutside } from '@/hooks/useClickOutside';
import { formatDate } from '@/lib/utils';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from './hooks';

export function NotificationsBell() {
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

  const onNotificationClick = (id: string, read: boolean, link?: string | null) => {
    if (!read) markAsRead.mutate(id);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="relative"
        aria-label={t('ariaLabel')}
        data-testid="notifications-bell"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-line bg-paper shadow-lg">
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
