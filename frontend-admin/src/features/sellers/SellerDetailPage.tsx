import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSeller, useUpdateSellerStatus } from './hooks';
import IdentityDocViewer from './components/IdentityDocViewer';
import { formatDate } from '@/lib/format';

export default function SellerDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: seller, isLoading } = useSeller(userId);
  const updateStatusMutation = useUpdateSellerStatus();
  const [note, setNote] = useState('');

  if (isLoading || !seller) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const profile = seller.sellerProfile;
  const isPending = seller.sellerStatus === 'pending';

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!userId) return;
    if (status === 'rejected' && !note.trim()) {
      if (!confirm('Rejeter sans indiquer de motif ?')) return;
    }
    await updateStatusMutation.mutateAsync({ userId, status, note: note.trim() || undefined });
    navigate('/vendeurs');
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/vendeurs')} sx={{ color: 'text.secondary', mb: 1.5 }}>
        Retour
      </Button>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4">{profile.storeName || seller.displayName}</Typography>
        <Chip
          label={seller.sellerStatus}
          color={seller.sellerStatus === 'approved' ? 'success' : seller.sellerStatus === 'pending' ? 'warning' : 'error'}
        />
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informations vendeur
              </Typography>
              <Stack spacing={1}>
                <Row label="Nom de la boutique" value={profile.storeName} />
                <Row label="Bio" value={profile.bio} />
                <Row label="Contact" value={`${seller.displayName} — ${seller.email}`} />
                <Row label="IBAN" value={profile.iban} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pièce d'identité
              </Typography>
              <Stack spacing={1} sx={{ mb: 2.5 }}>
                <Row label="Type de document" value={profile.idType === 'national_id' ? "Carte d'identité" : 'Passeport'} />
                <Row label="Numéro" value={profile.idNumber} />
                <Row label="Pays" value={profile.idCountry} />
                <Row label="Nom complet (document)" value={profile.fullNameOnId} />
                <Row label="Date de naissance" value={profile.dateOfBirth} />
                <Row label="Soumis le" value={profile.submittedAt ? formatDate(profile.submittedAt) : undefined} />
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <IdentityDocViewer label="Photo de profil" filename={profile.profilePhotoRef} />
                <IdentityDocViewer label="Document (recto)" filename={profile.idDocumentRef} />
                {profile.idType === 'national_id' && (
                  <IdentityDocViewer label="Document (verso)" filename={profile.idDocumentBackRef} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Décision
              </Typography>
              {profile.reviewedAt && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Dernière décision : {formatDate(profile.reviewedAt)}
                  {profile.reviewNote ? ` — ${profile.reviewNote}` : ''}
                </Typography>
              )}
              {isPending ? (
                <Stack spacing={2}>
                  <TextField
                    label="Note (motif de rejet, optionnel pour une approbation)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleDecision('approved')}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleDecision('rejected')}
                    >
                      Rejeter
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cette candidature a déjà été traitée.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value || '—'}</Typography>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}
