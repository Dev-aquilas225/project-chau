import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useCreateUser, useUpdateUser } from './hooks';
import type { UserProfile } from '@/types';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

interface FormValues {
  displayName: string;
  email: string;
  password: string;
}

export default function UserFormDialog({ open, onClose, user }: UserFormDialogProps) {
  const isEdit = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const { register, unregister, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    shouldUnregister: true,
    values: { displayName: user?.displayName ?? '', email: user?.email ?? '', password: '' },
  });

  useEffect(() => {
    if (isEdit) unregister('password');
  }, [isEdit, unregister]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && user) {
      await updateMutation.mutateAsync({ id: user.id, input: { displayName: values.displayName, email: values.email } });
    } else {
      await createMutation.mutateAsync(values);
    }
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField
              label="Nom"
              fullWidth
              {...register('displayName', { required: 'Le nom est requis', minLength: { value: 2, message: 'Minimum 2 caractères' } })}
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email', { required: "L'email est requis" })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            {!isEdit && (
              <TextField
                label="Mot de passe"
                type="password"
                fullWidth
                {...register('password', { required: 'Le mot de passe est requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Enregistrer
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
