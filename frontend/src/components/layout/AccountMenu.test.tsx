import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useAuthMock = vi.fn();
const refreshMock = vi.fn();
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

const logoutMock = vi.fn();
vi.mock('@/features/auth/api', () => ({
  logout: (...args: unknown[]) => logoutMock(...args),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

import { AccountMenu } from './AccountMenu';

describe('AccountMenu', () => {
  beforeEach(() => {
    refreshMock.mockReset();
    logoutMock.mockReset();
    navigateMock.mockReset();
  });

  it('affiche un lien "Connexion" si déconnecté', () => {
    useAuthMock.mockReturnValue({ user: null, refresh: refreshMock });
    render(<MemoryRouter><AccountMenu /></MemoryRouter>);
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.queryByTestId('account-menu-trigger')).not.toBeInTheDocument();
  });

  it('affiche les initiales et ouvre le menu compte si connecté', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1', displayName: 'Jean Dupont' }, refresh: refreshMock });
    render(<MemoryRouter><AccountMenu /></MemoryRouter>);

    expect(screen.getByText('JD')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('account-menu-trigger'));
    expect(screen.getByText('Mon compte')).toBeInTheDocument();
    expect(screen.getByText('Mes commandes')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('affiche la photo de profil (img) au lieu des initiales si photoURL est renseigné', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'u1', displayName: 'Jean Dupont', photoURL: '/uploads/avatars/abc.jpg' },
      refresh: refreshMock,
    });
    render(<MemoryRouter><AccountMenu /></MemoryRouter>);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/uploads/avatars/abc.jpg');
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('la déconnexion appelle logout(), refresh() puis redirige vers l\'accueil', async () => {
    logoutMock.mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({ user: { id: 'u1', displayName: 'Jean Dupont' }, refresh: refreshMock });
    render(<MemoryRouter><AccountMenu /></MemoryRouter>);

    fireEvent.click(screen.getByTestId('account-menu-trigger'));
    fireEvent.click(screen.getByText('Déconnexion'));

    await waitFor(() => expect(logoutMock).toHaveBeenCalled());
    expect(refreshMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
