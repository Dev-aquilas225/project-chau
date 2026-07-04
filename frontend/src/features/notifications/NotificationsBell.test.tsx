import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useAuthMock = vi.fn();
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

const useNotificationsMock = vi.fn();
const useUnreadCountMock = vi.fn();
const markAsReadMutateMock = vi.fn();
const markAllAsReadMutateMock = vi.fn();
vi.mock('./hooks', () => ({
  useNotifications: (...args: unknown[]) => useNotificationsMock(...args),
  useUnreadCount: (...args: unknown[]) => useUnreadCountMock(...args),
  useMarkAsRead: () => ({ mutate: markAsReadMutateMock }),
  useMarkAllAsRead: () => ({ mutate: markAllAsReadMutateMock }),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

import { NotificationsBell } from './NotificationsBell';

describe('NotificationsBell', () => {
  beforeEach(() => {
    useNotificationsMock.mockReset();
    useUnreadCountMock.mockReset();
    markAsReadMutateMock.mockReset();
    markAllAsReadMutateMock.mockReset();
    navigateMock.mockReset();
  });

  it("n'affiche rien si l'utilisateur n'est pas connecté", () => {
    useAuthMock.mockReturnValue({ user: null });
    useNotificationsMock.mockReturnValue({ data: [] });
    useUnreadCountMock.mockReturnValue({ data: { count: 0 } });

    render(<MemoryRouter><NotificationsBell /></MemoryRouter>);
    expect(screen.queryByTestId('notifications-bell')).not.toBeInTheDocument();
  });

  it('affiche le badge avec le nombre de notifications non lues', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1', displayName: 'Jean' } });
    useNotificationsMock.mockReturnValue({ data: [] });
    useUnreadCountMock.mockReturnValue({ data: { count: 3 } });

    render(<MemoryRouter><NotificationsBell /></MemoryRouter>);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('ouvre le panneau et marque comme lue au clic sur une notification, puis navigue vers son lien', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1', displayName: 'Jean' } });
    useNotificationsMock.mockReturnValue({
      data: [
        { id: 'n1', type: 'order_status', title: 'Commande mise à jour', message: 'Expédiée', link: '/commandes', read: false, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    });
    useUnreadCountMock.mockReturnValue({ data: { count: 1 } });

    render(<MemoryRouter><NotificationsBell /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('notifications-bell'));
    expect(screen.getByText('Commande mise à jour')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Commande mise à jour'));
    expect(markAsReadMutateMock).toHaveBeenCalledWith('n1');
    expect(navigateMock).toHaveBeenCalledWith('/commandes');
  });

  it('"Tout marquer comme lu" appelle la mutation correspondante', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1', displayName: 'Jean' } });
    useNotificationsMock.mockReturnValue({
      data: [{ id: 'n1', type: 'order_status', title: 'Titre', message: 'Msg', link: null, read: false, createdAt: '2026-01-01T00:00:00.000Z' }],
    });
    useUnreadCountMock.mockReturnValue({ data: { count: 1 } });

    render(<MemoryRouter><NotificationsBell /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('notifications-bell'));
    fireEvent.click(screen.getByText('Tout marquer comme lu'));
    expect(markAllAsReadMutateMock).toHaveBeenCalled();
  });
});
