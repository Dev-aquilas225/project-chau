import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useNotify, useRefresh } from 'react-admin';
import { customDataProvider } from '../../dataProvider';
import type { Order, OrderStatus } from '../../types';

// ===== CONSTANTES =====

const STATUS_CHOICES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' },
];

// ===== COMPOSANTS =====

interface OrderStatusDialogProps {
  open: boolean;
  status: OrderStatus;
  note: string;
  onStatusChange: (status: OrderStatus) => void;
  onNoteChange: (note: string) => void;
  onClose: () => void;
  onSave: () => void;
}

function OrderStatusDialog({
  open,
  status,
  note,
  onStatusChange,
  onNoteChange,
  onClose,
  onSave,
}: OrderStatusDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Statut de la commande</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          select
          label="Statut"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
        >
          {STATUS_CHOICES.map((choice) => (
            <MenuItem key={choice.value} value={choice.value}>
              {choice.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Note (optionnel)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={onSave}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ===== COMPOSANT PRINCIPAL =====

export function OrderStatusUpdateButton({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState('');
  const notify = useNotify();
  const refresh = useRefresh();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      await customDataProvider.updateOrderStatus(
        order.id,
        status,
        note || undefined
      );
      notify('Statut de la commande mis à jour.', { type: 'success' });
      handleClose();
      refresh();
    } catch {
      notify('Échec de la mise à jour.', { type: 'error' });
    }
  };

  const handleReset = () => {
    setStatus(order.status);
    setNote('');
    handleClose();
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={handleOpen}>
        Changer le statut
      </Button>

      <OrderStatusDialog
        open={open}
        status={status}
        note={note}
        onStatusChange={setStatus}
        onNoteChange={setNote}
        onClose={handleReset}
        onSave={handleSave}
      />
    </>
  );
}