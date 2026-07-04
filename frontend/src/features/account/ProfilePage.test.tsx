import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccessMock(...args), error: (...args: unknown[]) => toastErrorMock(...args) },
}));

const useAuthMock = vi.fn();
const refreshMock = vi.fn();
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

const logoutMock = vi.fn();
vi.mock('@/features/auth/api', () => ({
  logout: (...args: unknown[]) => logoutMock(...args),
}));

const apiFetchMock = vi.fn();
vi.mock('@/lib/http', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const uploadAvatarMock = vi.fn();
vi.mock('./api', () => ({
  uploadAvatar: (...args: unknown[]) => uploadAvatarMock(...args),
}));

import { ProfilePage } from './ProfilePage';

const baseProfile = {
  id: 'u1',
  email: 'jean@test.com',
  displayName: 'Jean Dupont',
  role: 'customer' as const,
  sellerStatus: 'none' as const,
  sellerProfile: {},
  addresses: [],
};

function setupAuth(overrides: Partial<typeof baseProfile> = {}) {
  const profile = { ...baseProfile, ...overrides };
  useAuthMock.mockReturnValue({ user: profile, profile, refresh: refreshMock });
}

describe('ProfilePage', () => {
  beforeEach(() => {
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    refreshMock.mockReset();
    logoutMock.mockReset();
    apiFetchMock.mockReset();
    uploadAvatarMock.mockReset();
    apiFetchMock.mockResolvedValue({});
  });

  it('affiche les initiales en avatar par défaut (pas de photoURL)', () => {
    setupAuth();
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('téléverse une nouvelle photo de profil et la persiste via PATCH /users/me', async () => {
    setupAuth();
    uploadAvatarMock.mockResolvedValue({ url: '/uploads/avatars/new.jpg' });
    const { container } = render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(uploadAvatarMock).toHaveBeenCalledWith(file));
    expect(apiFetchMock).toHaveBeenCalledWith('/users/me', { method: 'PATCH', body: { photoURL: '/uploads/avatars/new.jpg' } });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it('sauvegarde la bio ("à propos de toi")', async () => {
    setupAuth();
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText('Présente-toi aux autres membres'), { target: { value: 'Passionnée de mode vintage' } });
    fireEvent.click(screen.getAllByText('Enregistrer')[1]);

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith('/users/me', { method: 'PATCH', body: { bio: 'Passionnée de mode vintage' } }),
    );
  });

  it('sauvegarde la position (pays/ville)', async () => {
    setupAuth();
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText('Pays'), { target: { value: 'France' } });
    fireEvent.change(screen.getAllByPlaceholderText('Ville')[0], { target: { value: 'Lyon' } });
    fireEvent.click(screen.getAllByText('Enregistrer')[2]);

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith('/users/me', { method: 'PATCH', body: { country: 'France', city: 'Lyon' } }),
    );
  });

  it("n'affiche pas de régression : le nom d'utilisateur reste éditable et sauvegardable", async () => {
    setupAuth();
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    const nameInput = screen.getByDisplayValue('Jean Dupont');
    fireEvent.change(nameInput, { target: { value: 'Jean D.' } });
    fireEvent.click(screen.getAllByText('Enregistrer')[0]);

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith('/users/me', { method: 'PATCH', body: { displayName: 'Jean D.' } }),
    );
  });

  it("n'affiche pas de régression : la section adresses existante est toujours présente", () => {
    setupAuth();
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Adresses')).toBeInTheDocument();
    expect(screen.getByText("Ajouter l'adresse")).toBeInTheDocument();
  });
});
