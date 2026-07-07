import { useForm } from 'react-hook-form';
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import AvatarUploader from './AvatarUploader';
import { useUpdateMyProfile, useChangeMyPassword } from './hooks';
import { useAuth } from '@/features/auth/AuthProvider';

interface ProfileFormValues {
  displayName: string;
  bio: string;
  country: string;
  city: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const updateProfileMutation = useUpdateMyProfile();
  const changePasswordMutation = useChangeMyPassword();

  const profileForm = useForm<ProfileFormValues>({
    values: {
      displayName: user?.displayName ?? '',
      bio: user?.bio ?? '',
      country: user?.country ?? '',
      city: user?.city ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmitProfile = async (values: ProfileFormValues) => {
    await updateProfileMutation.mutateAsync(values);
    await refresh();
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Les mots de passe ne correspondent pas' });
      return;
    }
    await changePasswordMutation.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    passwordForm.reset();
  };

  const handleAvatarChange = async (url: string) => {
    await updateProfileMutation.mutateAsync({ photoURL: url });
    await refresh();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mon profil
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <AvatarUploader photoURL={user?.photoURL} displayName={user?.displayName} onChange={handleAvatarChange} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{user?.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cliquer sur la photo pour la changer (JPEG, PNG, WebP ou GIF, 5 Mo max)
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card component="form" onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Informations</Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Nom"
                    fullWidth
                    {...profileForm.register('displayName', { required: 'Le nom est requis', minLength: { value: 2, message: 'Minimum 2 caractères' } })}
                    error={!!profileForm.formState.errors.displayName}
                    helperText={profileForm.formState.errors.displayName?.message}
                  />
                  <TextField label="À propos de moi" fullWidth multiline minRows={2} {...profileForm.register('bio')} />
                  <Stack direction="row" spacing={2}>
                    <TextField label="Pays" fullWidth {...profileForm.register('country')} />
                    <TextField label="Ville" fullWidth {...profileForm.register('city')} />
                  </Stack>
                  <Box>
                    <Button type="submit" variant="contained" disabled={profileForm.formState.isSubmitting}>
                      Enregistrer
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card component="form" onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Mot de passe</Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Mot de passe actuel"
                    type="password"
                    fullWidth
                    {...passwordForm.register('currentPassword', { required: 'Requis' })}
                    error={!!passwordForm.formState.errors.currentPassword}
                    helperText={passwordForm.formState.errors.currentPassword?.message}
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Nouveau mot de passe"
                      type="password"
                      fullWidth
                      {...passwordForm.register('newPassword', { required: 'Requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
                      error={!!passwordForm.formState.errors.newPassword}
                      helperText={passwordForm.formState.errors.newPassword?.message}
                    />
                    <TextField
                      label="Confirmer le mot de passe"
                      type="password"
                      fullWidth
                      {...passwordForm.register('confirmPassword', { required: 'Requis' })}
                      error={!!passwordForm.formState.errors.confirmPassword}
                      helperText={passwordForm.formState.errors.confirmPassword?.message}
                    />
                  </Stack>
                  <Box>
                    <Button type="submit" variant="contained" disabled={passwordForm.formState.isSubmitting}>
                      Changer le mot de passe
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
