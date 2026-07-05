import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, TextField, Button, Typography, Alert } from '@mui/material';
import { loginSchema, type LoginFormValues } from './schemas';
import { loginWithEmail } from './api';
import { useAuth } from './AuthProvider';
import { ApiError } from '@/lib/http';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await loginWithEmail(values.email, values.password);
      if (user.role !== 'admin') {
        setServerError('Ce compte ne dispose pas des droits administrateur.');
        return;
      }
      await refresh();
      const redirect = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(redirect, { replace: true });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Connexion impossible');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper elevation={0} sx={{ p: 5, width: 400, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Aquilas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Back-office administrateur
            </Typography>
          </Box>

          {serverError && <Alert severity="error">{serverError}</Alert>}

          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
              Se connecter
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
