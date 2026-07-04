import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SellersPage } from './SellersPage';
import { listSellers } from './api';
import { apiFetchBlob } from '@/lib/http';
import type { UserProfile } from '@/types';

vi.mock('./api', () => ({
  listSellers: vi.fn(),
  updateSellerStatus: vi.fn(),
}));

vi.mock('@/lib/http', () => ({
  apiFetchBlob: vi.fn().mockResolvedValue(new Blob(['fake'])),
}));

const pendingSeller: UserProfile = {
  id: 'user-1',
  email: 'seller@test.com',
  displayName: 'Jean Dupont',
  role: 'customer',
  sellerStatus: 'pending',
  createdAt: new Date('2026-01-01'),
  sellerProfile: {
    storeName: 'Ma Boutique',
    idType: 'national_id',
    idNumber: 'ID123456',
    idCountry: 'FR',
    fullNameOnId: 'Jean Dupont',
    dateOfBirth: '1990-01-01',
    idDocumentRef: 'user-1-id-document-123.jpg',
    idDocumentBackRef: 'user-1-id-document-back-789.jpg',
    profilePhotoRef: 'user-1-profile-photo-456.jpg',
  },
};

const rejectedSeller: UserProfile = {
  ...pendingSeller,
  id: 'user-2',
  sellerStatus: 'rejected',
  sellerProfile: {
    ...pendingSeller.sellerProfile,
    reviewNote: 'Photo de la pièce illisible',
    reviewedAt: '2026-01-02T00:00:00.000Z',
  },
};

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('SellersPage', () => {
  beforeEach(() => {
    vi.mocked(listSellers).mockReset();
    vi.mocked(apiFetchBlob).mockClear();
  });

  it('ouvre la modal détail et affiche les champs KYC au clic sur "Détails"', async () => {
    vi.mocked(listSellers).mockResolvedValue([pendingSeller]);
    renderWithClient(<SellersPage />);

    await waitFor(() => expect(screen.getByText('Jean Dupont')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /détails/i }));

    expect(screen.getByText("Vérification d'identité — Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText('ID123456')).toBeInTheDocument();
    expect(screen.getByText("Carte nationale d'identité")).toBeInTheDocument();
    await waitFor(() => expect(apiFetchBlob).toHaveBeenCalledWith('/uploads/identity/user-1-id-document-123.jpg'));
    await waitFor(() => expect(apiFetchBlob).toHaveBeenCalledWith('/uploads/identity/user-1-id-document-back-789.jpg'));
    await waitFor(() => expect(apiFetchBlob).toHaveBeenCalledWith('/uploads/identity/user-1-profile-photo-456.jpg'));
  });

  it("affiche uniquement le recto (pas de bloc verso) pour un passeport", async () => {
    const passportSeller: UserProfile = {
      ...pendingSeller,
      id: 'user-3',
      sellerProfile: {
        ...pendingSeller.sellerProfile,
        idType: 'passport',
        idDocumentBackRef: undefined,
      },
    };
    vi.mocked(listSellers).mockResolvedValue([passportSeller]);
    renderWithClient(<SellersPage />);

    await waitFor(() => expect(screen.getByText('Jean Dupont')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /détails/i }));

    expect(screen.getByText("Vérification d'identité — Jean Dupont")).toBeInTheDocument();
    expect(screen.queryByText("Pièce d'identité (verso)")).not.toBeInTheDocument();
  });

  it('affiche le motif de rejet dans la modal détail pour un vendeur rejeté', async () => {
    vi.mocked(listSellers).mockResolvedValue([rejectedSeller]);
    renderWithClient(<SellersPage />);

    await waitFor(() => expect(screen.getByText('Jean Dupont')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /détails/i }));

    await waitFor(() => expect(screen.getByText('Photo de la pièce illisible')).toBeInTheDocument());
  });

  it("n'affiche pas de bloc motif quand reviewNote est absent", async () => {
    vi.mocked(listSellers).mockResolvedValue([pendingSeller]);
    renderWithClient(<SellersPage />);

    await waitFor(() => expect(screen.getByText('Jean Dupont')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /détails/i }));

    await waitFor(() => expect(apiFetchBlob).toHaveBeenCalled());
    expect(screen.queryByText(/^Motif/)).not.toBeInTheDocument();
  });
});
