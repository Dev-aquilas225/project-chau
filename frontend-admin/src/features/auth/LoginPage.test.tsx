import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const refreshMock = vi.fn();
vi.mock('./AuthProvider', () => ({
  adminLogin: vi.fn(),
  useAuth: () => ({ refresh: refreshMock }),
}));

import { LoginPage } from './LoginPage';

describe('LoginPage (admin)', () => {
  it("affiche des identifiants de démo qui correspondent au compte admin réellement seedé (admin@gmail.com, cf. SeedService)", () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    // Régression : le hint affichait auparavant "admin@aquilas.com", un reliquat du
    // rebranding Aquilas -> Occasion de luxe PJ international. Ce compte n'existe pas
    // en base (seul admin@gmail.com est créé par SeedService), rendant la connexion
    // avec les identifiants de démo systématiquement impossible.
    expect(screen.getByText('Démo : admin@gmail.com / admin1234')).toBeInTheDocument();
    expect(screen.queryByText(/admin@aquilas\.com/)).not.toBeInTheDocument();
  });
});
