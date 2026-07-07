import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateMyProfile, changeMyPassword, uploadAvatar } from './api';
import type { UpdateMyProfileInput, ChangeMyPasswordInput } from './api';
import { ApiError } from '@/lib/http';

export function useUpdateMyProfile() {
  return useMutation({
    mutationFn: (input: UpdateMyProfileInput) => updateMyProfile(input),
    onSuccess: () => toast.success('Profil mis à jour'),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour'),
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: (input: ChangeMyPasswordInput) => changeMyPassword(input),
    onSuccess: () => toast.success('Mot de passe changé'),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Erreur lors du changement de mot de passe'),
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'upload"),
  });
}
