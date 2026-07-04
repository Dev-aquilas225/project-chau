import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const applyAsSellerMock = vi.fn();
const setTokenMock = vi.fn();

vi.mock('./api', () => ({
  applyAsSeller: (...args: unknown[]) => applyAsSellerMock(...args),
}));

vi.mock('@/lib/http', () => ({
  setToken: (...args: unknown[]) => setTokenMock(...args),
  getToken: vi.fn(() => null),
}));

import { useApplyAsSeller } from './hooks';

describe('useApplyAsSeller', () => {
  beforeEach(() => {
    applyAsSellerMock.mockReset();
    setTokenMock.mockReset();
  });

  it('stocke le nouveau token (setToken) AVANT d\'invalider le cache seller-profile', async () => {
    const response = { accessToken: 'fresh-jwt-token', user: { id: 'u1', sellerStatus: 'approved' } };
    applyAsSellerMock.mockResolvedValue(response);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useApplyAsSeller(), { wrapper });

    result.current.mutate({
      storeName: 'Ma Boutique',
      idType: 'national_id',
      idNumber: 'ID123',
      idCountry: 'FR',
      fullNameOnId: 'Jean Dupont',
      dateOfBirth: '1990-01-01',
      idDocumentRef: 'u1-id-document-1.jpg',
      profilePhotoRef: 'u1-profile-photo-1.jpg',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setTokenMock).toHaveBeenCalledWith('fresh-jwt-token');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['seller-profile'] });

    // Ordre important : le token doit être posé avant l'invalidation, sinon le
    // refetch déclenché par invalidateQueries utiliserait encore l'ancien JWT.
    const setTokenOrder = setTokenMock.mock.invocationCallOrder[0];
    const invalidateOrder = invalidateSpy.mock.invocationCallOrder[0];
    expect(setTokenOrder).toBeLessThan(invalidateOrder);
  });

  it('ne stocke pas de token et ne modifie pas le cache si la mutation échoue', async () => {
    applyAsSellerMock.mockRejectedValue(new Error('Document invalide ou manquant'));

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useApplyAsSeller(), { wrapper });

    result.current.mutate({
      storeName: 'Ma Boutique',
      idType: 'national_id',
      idNumber: 'ID123',
      idCountry: 'FR',
      fullNameOnId: 'Jean Dupont',
      dateOfBirth: '1990-01-01',
      idDocumentRef: 'bad-ref.jpg',
      profilePhotoRef: 'bad-ref-2.jpg',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setTokenMock).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
