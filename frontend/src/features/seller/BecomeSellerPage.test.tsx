import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastErrorMock(...args), success: (...args: unknown[]) => toastSuccessMock(...args) },
}));

const useAuthMock = vi.fn();
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

const mutateAsyncMock = vi.fn();
const useApplyAsSellerMock = vi.fn();
vi.mock('./hooks', () => ({
  useApplyAsSeller: () => useApplyAsSellerMock(),
}));

const uploadIdentityDocumentMock = vi.fn();
vi.mock('./api', () => ({
  uploadIdentityDocument: (...args: unknown[]) => uploadIdentityDocumentMock(...args),
}));

import { BecomeSellerPage } from './BecomeSellerPage';

const refreshMock = vi.fn();

function setupAuth(overrides: Partial<ReturnType<typeof useAuthMock>> = {}) {
  useAuthMock.mockReturnValue({
    loading: false,
    user: { id: 'user-1', email: 'seller@test.com' },
    sellerStatus: 'none',
    refresh: refreshMock,
    ...overrides,
  });
}

function makeFile(name: string) {
  return new File(['content'], name, { type: 'image/png' });
}

// Les champs du formulaire n'associent pas <label>/<input> via htmlFor/id (ils sont
// simplement adjacents dans le DOM) : getByLabelText ne peut donc pas les trouver.
// On retrouve l'input à partir du texte du label, en remontant à son conteneur commun.
function getFieldByLabelText(text: string): HTMLInputElement {
  const label = screen.getByText(text);
  const input = label.parentElement?.querySelector('input');
  if (!input) throw new Error(`Aucun input trouvé à côté du label "${text}"`);
  return input as HTMLInputElement;
}

function clickNext() {
  fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
}

// Étape 0 (Boutique) -> remplit et passe à l'étape 1 (Identité).
function fillStoreStepAndNext(storeName = 'Ma Boutique') {
  fireEvent.change(screen.getByPlaceholderText('Ex : Élégance Parisienne'), { target: { value: storeName } });
  clickNext();
}

// Étape 1 (Identité) -> remplit et passe à l'étape 2 (Documents).
function fillIdentityStepAndNext() {
  fireEvent.change(getFieldByLabelText('Numéro de la pièce *'), { target: { value: 'ID123456' } });
  fireEvent.change(screen.getByPlaceholderText('Ex : France'), { target: { value: 'France' } });
  fireEvent.change(getFieldByLabelText('Date de naissance *'), { target: { value: '1990-01-01' } });
  fireEvent.change(getFieldByLabelText("Nom complet (tel qu'indiqué sur la pièce) *"), { target: { value: 'Jean Dupont' } });
  clickNext();
}

// Étape 2 (Documents) : téléverse recto + (verso si CNI) + photo de profil, puis passe à l'étape 3 (Récapitulatif).
async function uploadDocumentsStepAndNext(container: HTMLElement, { nationalId = true } = {}) {
  uploadIdentityDocumentMock.mockResolvedValueOnce({ ref: 'user-1-id-document-1.png' });
  if (nationalId) uploadIdentityDocumentMock.mockResolvedValueOnce({ ref: 'user-1-id-document-back-1.png' });
  uploadIdentityDocumentMock.mockResolvedValueOnce({ ref: 'user-1-profile-photo-1.png' });

  const fileInputs = container.querySelectorAll('input[type="file"]');
  expect(fileInputs).toHaveLength(nationalId ? 3 : 2);
  const nextButton = screen.getByRole('button', { name: /Suivant/i });

  fireEvent.change(fileInputs[0], { target: { files: [makeFile('id-recto.png')] } });
  await waitFor(() => expect(nextButton).not.toBeDisabled());

  if (nationalId) {
    fireEvent.change(fileInputs[1], { target: { files: [makeFile('id-verso.png')] } });
    await waitFor(() => expect(nextButton).not.toBeDisabled());
  }

  fireEvent.change(fileInputs[nationalId ? 2 : 1], { target: { files: [makeFile('selfie.png')] } });
  await waitFor(() => expect(nextButton).not.toBeDisabled());

  clickNext();
}

function clickFinalSubmit() {
  fireEvent.click(screen.getByRole('button', { name: /Confirmer et soumettre/i }));
}

describe('BecomeSellerPage', () => {
  beforeEach(() => {
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    refreshMock.mockReset();
    uploadIdentityDocumentMock.mockReset();
    mutateAsyncMock.mockReset();
    useApplyAsSellerMock.mockReturnValue({ mutateAsync: mutateAsyncMock, isPending: false });
    setupAuth();
  });

  it("bloque le passage à l'étape suivante si le nom de boutique est vide", () => {
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    clickNext();

    expect(toastErrorMock).toHaveBeenCalledWith('Nom de boutique requis');
    expect(screen.queryByText('Numéro de la pièce *')).not.toBeInTheDocument();
  });

  it("bloque le passage à l'étape Documents si un champ d'identité obligatoire est manquant", () => {
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    fillStoreStepAndNext();
    clickNext(); // aucun champ d'identité rempli

    expect(toastErrorMock).toHaveBeenCalledWith("Merci de compléter toutes les informations d'identité");
    expect(screen.queryByText("Pièce d'identité (recto) *")).not.toBeInTheDocument();
  });

  it("bloque le passage au récapitulatif si la pièce d'identité n'est pas téléversée", () => {
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    fillStoreStepAndNext();
    fillIdentityStepAndNext();
    clickNext(); // aucun document téléversé

    expect(toastErrorMock).toHaveBeenCalledWith("Merci de téléverser votre pièce d'identité");
    expect(screen.queryByRole('heading', { name: /récapitulatif/i })).not.toBeInTheDocument();
  });

  it("bloque le passage au récapitulatif (CNI) si le verso n'est pas téléversé", async () => {
    uploadIdentityDocumentMock.mockResolvedValueOnce({ ref: 'user-1-id-document-1.png' });
    const { container } = render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    fillStoreStepAndNext();
    fillIdentityStepAndNext();

    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs).toHaveLength(3); // national_id par défaut : recto + verso + profil
    const nextButton = screen.getByRole('button', { name: /Suivant/i });
    fireEvent.change(fileInputs[0], { target: { files: [makeFile('id-recto.png')] } });
    await waitFor(() => expect(nextButton).not.toBeDisabled());

    clickNext();

    expect(toastErrorMock).toHaveBeenCalledWith("Merci de téléverser le verso de votre pièce d'identité");
    expect(screen.queryByRole('heading', { name: /récapitulatif/i })).not.toBeInTheDocument();
  });

  it('parcourt les 4 étapes puis soumet le payload complet à applyAsSeller, stocke le token et affiche le succès', async () => {
    mutateAsyncMock.mockResolvedValue({ accessToken: 'jwt', user: { sellerStatus: 'approved' } });
    const { container } = render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);

    fillStoreStepAndNext();
    fillIdentityStepAndNext();
    await uploadDocumentsStepAndNext(container);

    expect(screen.getByRole('heading', { name: /récapitulatif/i })).toBeInTheDocument();
    clickFinalSubmit();

    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledTimes(1));
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      storeName: 'Ma Boutique',
      bio: undefined,
      idType: 'national_id',
      idNumber: 'ID123456',
      idCountry: 'France',
      fullNameOnId: 'Jean Dupont',
      dateOfBirth: '1990-01-01',
      idDocumentRef: 'user-1-id-document-1.png',
      idDocumentBackRef: 'user-1-id-document-back-1.png',
      profilePhotoRef: 'user-1-profile-photo-1.png',
    });

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(toastSuccessMock).toHaveBeenCalledWith('Candidature envoyée : votre compte est en cours de vérification.');
  });

  it("affiche un toast d'erreur si la soumission échoue côté serveur (ex: document invalide)", async () => {
    mutateAsyncMock.mockRejectedValue(new Error('Document invalide ou manquant'));
    const { container } = render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);

    fillStoreStepAndNext();
    fillIdentityStepAndNext();
    await uploadDocumentsStepAndNext(container);
    clickFinalSubmit();

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledWith('Impossible de soumettre la candidature'));
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('pour un passeport, un seul upload de pièce est requis (pas de verso)', async () => {
    mutateAsyncMock.mockResolvedValue({ accessToken: 'jwt', user: { sellerStatus: 'approved' } });
    const { container } = render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);

    fillStoreStepAndNext();
    fireEvent.change(screen.getByDisplayValue("Carte nationale d'identité"), { target: { value: 'passport' } });
    fillIdentityStepAndNext();
    await uploadDocumentsStepAndNext(container, { nationalId: false });
    clickFinalSubmit();

    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledTimes(1));
    expect(mutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idType: 'passport',
        idDocumentRef: 'user-1-id-document-1.png',
        idDocumentBackRef: undefined,
        profilePhotoRef: 'user-1-profile-photo-1.png',
      }),
    );
  });

  it('le récapitulatif affiche les informations saisies avant soumission', async () => {
    const { container } = render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    fillStoreStepAndNext();
    fillIdentityStepAndNext();
    await uploadDocumentsStepAndNext(container);

    expect(screen.getByText('Ma Boutique')).toBeInTheDocument();
    expect(screen.getByText('ID123456')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('affiche la branche "pending" sans formulaire quand sellerStatus === pending', () => {
    setupAuth({ sellerStatus: 'pending' });
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    expect(screen.getByText('Candidature en attente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Suivant/i })).not.toBeInTheDocument();
  });

  it('affiche la branche "rejected" sans formulaire quand sellerStatus === rejected', () => {
    setupAuth({ sellerStatus: 'rejected' });
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    expect(screen.getByText('Candidature refusée')).toBeInTheDocument();
  });

  it('affiche le motif de rejet quand user.sellerProfile.reviewNote est renseigné', () => {
    setupAuth({
      sellerStatus: 'rejected',
      user: { id: 'user-1', email: 'seller@test.com', sellerProfile: { reviewNote: 'Photo de la pièce illisible' } },
    });
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    expect(screen.getByText('Photo de la pièce illisible')).toBeInTheDocument();
  });

  it("n'affiche aucun bloc motif quand reviewNote est absent", () => {
    setupAuth({ sellerStatus: 'rejected' });
    render(<MemoryRouter><BecomeSellerPage /></MemoryRouter>);
    expect(screen.queryByText('Motif indiqué par notre équipe :')).not.toBeInTheDocument();
  });
});
