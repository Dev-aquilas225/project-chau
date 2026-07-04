import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useLogin, useNotify } from 'react-admin';
import { colors } from '../theme/tokens';

// ===== CONSTANTES =====

const DEMO_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin1234',
};

// ===== COMPOSANTS =====

function LoginHero() {
  return (
    <Box
      sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
        px: 8,
        color: '#fff',
        background: `linear-gradient(160deg, ${colors.sidebarBg} 0%, ${colors.sidebarBgActive} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Effet de fond décoratif */}
      <Box
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}55 0%, transparent 70%)`,
          top: -120,
          right: -120,
        }}
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
          }}
        >
          <StorefrontIcon />
        </Box>
        <Typography variant="h5" fontWeight={700}>
          C2C Admin
        </Typography>
      </Stack>

      <Typography variant="h4" fontWeight={700} sx={{ maxWidth: 420, position: 'relative' }}>
        Pilotez votre marketplace en toute simplicité
      </Typography>

      <Typography
        variant="body1"
        sx={{ maxWidth: 420, color: 'rgba(255,255,255,0.75)', position: 'relative' }}
      >
        Vendeurs, produits, commandes et paiements réunis dans un seul back-office.
      </Typography>
    </Box>
  );
}

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 380,
        p: 4,
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Connexion
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Accès réservé aux administrateurs de la marketplace.
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoFocus
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ py: 1.2 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Se connecter'}
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Démo : {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
      </Typography>
    </Paper>
  );
}

// ===== COMPOSANT PRINCIPAL =====

export function LoginPage() {
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await login({ username: email, password });
    } catch {
      notify('Identifiants incorrects ou accès non autorisé.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: colors.contentBg,
      }}
    >
      <LoginHero />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </Box>
    </Box>
  );
}