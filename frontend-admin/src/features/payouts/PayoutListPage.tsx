import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { usePayouts, useReviewPayout } from './hooks';
import { formatDate } from '@/lib/format';
import type { PayoutRequest } from '@/types';

export default function PayoutListPage() {
  const { data: payouts = [], isLoading } = usePayouts();
  const reviewMutation = useReviewPayout();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'rejected'>('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [actionType, setActionType] = useState<'paid' | 'rejected' | null>(null);
  const [note, setNote] = useState('');

  const filteredPayouts = payouts.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const handleOpenDialog = (payout: PayoutRequest, type: 'paid' | 'rejected') => {
    setSelectedPayout(payout);
    setActionType(type);
    setNote('');
  };

  const handleCloseDialog = () => {
    setSelectedPayout(null);
    setActionType(null);
    setNote('');
  };

  const handleSubmit = async () => {
    if (!selectedPayout || !actionType) return;
    await reviewMutation.mutateAsync({
      id: selectedPayout.id,
      status: actionType,
      reviewNote: note.trim() || undefined,
    });
    handleCloseDialog();
  };

  const getStatusChip = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Chip label="En attente" color="warning" size="small" variant="outlined" />;
      case 'processing':
        return <Chip label="En cours" color="info" size="small" variant="outlined" />;
      case 'paid':
        return <Chip label="Virement effectué" color="success" size="small" variant="outlined" />;
      case 'rejected':
        return <Chip label="Refusé" color="error" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  const totalPending = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount as any), 0);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Demandes de retraits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez et validez les virements vers les comptes bancaires (IBAN) des vendeurs.
          </Typography>
        </Box>
      </Box>

      {/* Stats Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Volume en attente
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: totalPending > 0 ? 'warning.main' : 'text.primary' }}>
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalPending)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Demandes à traiter
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {payouts.filter((p) => p.status === 'pending').length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            '& .MuiTab-root': { py: 2, fontSize: 13, fontWeight: 600 },
          }}
        >
          <Tab label="Toutes" value="all" />
          <Tab label="En attente" value="pending" />
          <Tab label="Virement effectué" value="paid" />
          <Tab label="Refusées" value="rejected" />
        </Tabs>

        {/* Payouts Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vendeur</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>IBAN</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Note admin</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Chargement des données...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredPayouts.length > 0 ? (
                filteredPayouts.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{formatDate(p.createdAt)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {p.user?.displayName || 'Utilisateur inconnu'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {p.user?.sellerProfile?.iban || 'Aucun IBAN'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.reviewNote || '—'}
                    </TableCell>
                    <TableCell align="right">
                      {p.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleOpenDialog(p, 'rejected')}
                          >
                            Refuser
                          </Button>
                          <Button
                            size="small"
                            color="success"
                            variant="contained"
                            onClick={() => handleOpenDialog(p, 'paid')}
                          >
                            Valider virement
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucune demande de retrait trouvée</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Review Dialog */}
      <Dialog open={selectedPayout !== null} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {actionType === 'paid' ? 'Valider la demande de retrait' : 'Refuser la demande de retrait'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {actionType === 'paid'
              ? `Veuillez confirmer que le virement de ${selectedPayout ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPayout.amount) : ''} vers l'IBAN du vendeur a bien été effectué.`
              : 'Veuillez saisir le motif du refus pour notifier le vendeur. Le montant sera restitué à son solde disponible.'}
          </Typography>
          <TextField
            label="Note ou motif d'avis"
            multiline
            rows={3}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required={actionType === 'rejected'}
            placeholder={actionType === 'paid' ? 'Ex: Virement SEPA réf #1293' : 'Ex: IBAN incorrect ou non valide'}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            color={actionType === 'paid' ? 'success' : 'error'}
            variant="contained"
            disabled={actionType === 'rejected' && !note.trim()}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getStatusBadge(status: PayoutRequest['status']) {
  switch (status) {
    case 'pending':
      return <Chip label="En attente" color="warning" size="small" variant="outlined" />;
    case 'paid':
      return <Chip label="Virement effectué" color="success" size="small" variant="outlined" />;
    case 'rejected':
      return <Chip label="Refusé" color="error" size="small" variant="outlined" />;
    default:
      return <Chip label={status} size="small" variant="outlined" />;
  }
}
