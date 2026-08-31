import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  useShippingZones,
  useCreateShippingZone,
  useUpdateShippingZone,
  useDeleteShippingZone,
} from './hooks';
import type { ShippingZone, CreateShippingZonePayload } from './api';

// ─── Formulaire de zone ─────────────────────────────────────────────────────

const EMPTY_FORM: CreateShippingZonePayload = {
  name: '',
  carrier: '',
  countryCodes: [],
  basePrice: 0,
  freeThreshold: null,
  estimatedDaysMin: 2,
  estimatedDaysMax: 7,
  sortOrder: 99,
  active: true,
};

function ZoneForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CreateShippingZonePayload;
  onSave: (data: CreateShippingZonePayload) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CreateShippingZonePayload>(initial);
  const [codesInput, setCodesInput] = useState(initial.countryCodes.join(', '));

  const set = (field: keyof CreateShippingZonePayload, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    const codes = codesInput
      .split(/[\s,]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    onSave({ ...form, countryCodes: codes });
  };

  return (
    <Stack spacing={2.5} sx={{ pt: 1 }}>
      <TextField
        label="Nom de la zone"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        fullWidth
        required
        placeholder="ex: Amériques"
      />
      <TextField
        label="Transporteur"
        value={form.carrier}
        onChange={(e) => set('carrier', e.target.value)}
        fullWidth
        placeholder="ex: DHL Express"
      />
      <TextField
        label="Codes pays (ISO 3166-1 alpha-2, séparés par virgule)"
        value={codesInput}
        onChange={(e) => setCodesInput(e.target.value)}
        fullWidth
        multiline
        rows={2}
        helperText="Laisser vide pour une zone globale (fallback toutes destinations)"
        placeholder="ex: US, CA, MX, BR"
      />
      <Stack direction="row" spacing={2}>
        <TextField
          label="Prix de base"
          type="number"
          value={form.basePrice}
          onChange={(e) => set('basePrice', parseFloat(e.target.value) || 0)}
          InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
          fullWidth
          inputProps={{ min: 0, step: 0.5 }}
        />
        <TextField
          label="Gratuit à partir de"
          type="number"
          value={form.freeThreshold ?? ''}
          onChange={(e) =>
            set('freeThreshold', e.target.value ? parseFloat(e.target.value) : null)
          }
          InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
          fullWidth
          inputProps={{ min: 0, step: 10 }}
          helperText="Laisser vide = jamais gratuit"
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Délai min (jours)"
          type="number"
          value={form.estimatedDaysMin}
          onChange={(e) => set('estimatedDaysMin', parseInt(e.target.value) || 1)}
          fullWidth
          inputProps={{ min: 1 }}
        />
        <TextField
          label="Délai max (jours)"
          type="number"
          value={form.estimatedDaysMax}
          onChange={(e) => set('estimatedDaysMax', parseInt(e.target.value) || 1)}
          fullWidth
          inputProps={{ min: 1 }}
        />
        <TextField
          label="Ordre d'affichage"
          type="number"
          value={form.sortOrder}
          onChange={(e) => set('sortOrder', parseInt(e.target.value) || 99)}
          fullWidth
          inputProps={{ min: 0 }}
        />
      </Stack>
      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button onClick={onCancel} disabled={saving}>Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !form.name}>
          {saving ? <CircularProgress size={18} /> : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Stack>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function ShippingZonesPage() {
  const { data: zones, isLoading } = useShippingZones();
  const createMutation = useCreateShippingZone();
  const updateMutation = useUpdateShippingZone();
  const deleteMutation = useDeleteShippingZone();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editZone, setEditZone] = useState<ShippingZone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditZone(null); setDialogOpen(true); };
  const openEdit = (z: ShippingZone) => { setEditZone(z); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditZone(null); };

  const handleSave = async (data: CreateShippingZonePayload) => {
    if (editZone) {
      await updateMutation.mutateAsync({ id: editZone.id, payload: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    closeDialog();
  };

  const handleToggleActive = (zone: ShippingZone) => {
    updateMutation.mutate({ id: zone.id, payload: { active: !zone.active } });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalShippingOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Zones de Livraison
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Ajouter une zone
        </Button>
      </Box>

      {/* Info expédition */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 3, bgcolor: 'primary.50', borderColor: 'primary.200', borderRadius: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          📍 <strong>Point d'expédition :</strong> France (Paris) — Les délais sont calculés depuis ce point.
          &nbsp;|&nbsp; 🌎 <strong>Amériques :</strong> DHL Express recommandé (3–5 jours ouvrés).
          &nbsp;|&nbsp; Les zones sont évaluées par code pays ISO 3166-1 alpha-2. La zone globale (sans pays) sert de fallback.
        </Typography>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Zone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Transporteur</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pays couverts</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prix</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gratuit dès</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Délai</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actif</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones?.map((zone) => (
                <TableRow key={zone.id} hover sx={{ opacity: zone.active ? 1 : 0.5 }}>
                  <TableCell sx={{ fontWeight: 600 }}>{zone.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={zone.carrier || '—'}
                      size="small"
                      color={zone.carrier.includes('DHL') ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {zone.countryCodes.length === 0 ? (
                      <Chip label="Global (fallback)" size="small" color="warning" variant="outlined" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {zone.countryCodes.slice(0, 6).join(', ')}
                        {zone.countryCodes.length > 6 && ` +${zone.countryCodes.length - 6}`}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {zone.basePrice.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {zone.freeThreshold !== null ? (
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        {zone.freeThreshold.toFixed(0)} €
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {zone.estimatedDaysMin}–{zone.estimatedDaysMax} j.
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={zone.active}
                      onChange={() => handleToggleActive(zone)}
                      disabled={updateMutation.isPending}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => openEdit(zone)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(zone.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!zones || zones.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Aucune zone configurée — cliquez sur "Ajouter une zone" pour commencer
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editZone ? 'Modifier la zone' : 'Nouvelle zone de livraison'}
        </DialogTitle>
        <DialogContent>
          <ZoneForm
            initial={editZone ? {
              name: editZone.name,
              carrier: editZone.carrier,
              countryCodes: editZone.countryCodes,
              basePrice: editZone.basePrice,
              freeThreshold: editZone.freeThreshold,
              estimatedDaysMin: editZone.estimatedDaysMin,
              estimatedDaysMax: editZone.estimatedDaysMax,
              sortOrder: editZone.sortOrder,
              active: editZone.active,
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={closeDialog}
            saving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Supprimer cette zone ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Cette action est irréversible. Les commandes existantes ne seront pas affectées.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={18} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
