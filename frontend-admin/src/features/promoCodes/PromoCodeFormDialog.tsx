import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { promoCodeSchema, type PromoCodeFormValues } from './schemas';
import { useCreatePromoCode, useUpdatePromoCode } from './hooks';
import type { PromoCode } from '@/types';

interface PromoCodeFormDialogProps {
  open: boolean;
  onClose: () => void;
  promoCode: PromoCode | null;
}

export default function PromoCodeFormDialog({ open, onClose, promoCode }: PromoCodeFormDialogProps) {
  const createMutation = useCreatePromoCode();
  const updateMutation = useUpdatePromoCode();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    values: {
      code: promoCode?.code ?? '',
      discountType: promoCode?.discountType ?? 'percentage',
      discountValue: promoCode?.discountValue ?? 0,
      minAmount: promoCode?.minAmount ?? 0,
      expiresAt: promoCode?.expiresAt ? dayjs(promoCode.expiresAt).format('YYYY-MM-DDTHH:mm') : '',
      active: promoCode?.active ?? true,
    },
  });

  const onSubmit = async (values: PromoCodeFormValues) => {
    const input = {
      ...values,
      expiresAt: values.expiresAt ? dayjs(values.expiresAt).toISOString() : undefined,
    };
    if (promoCode) {
      await updateMutation.mutateAsync({ id: promoCode.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{promoCode ? 'Modifier le code promo' : 'Nouveau code promo'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField
              label="Code"
              fullWidth
              {...register('code')}
              error={!!errors.code}
              helperText={errors.code?.message}
            />
            <Stack direction="row" spacing={2}>
              <TextField label="Type" select fullWidth defaultValue={promoCode?.discountType ?? 'percentage'} {...register('discountType')}>
                <MenuItem value="percentage">Pourcentage</MenuItem>
                <MenuItem value="fixed">Montant fixe</MenuItem>
              </TextField>
              <TextField
                label="Valeur"
                type="number"
                fullWidth
                {...register('discountValue')}
                error={!!errors.discountValue}
                helperText={errors.discountValue?.message}
              />
            </Stack>
            <TextField label="Montant minimum (€)" type="number" fullWidth {...register('minAmount')} />
            <TextField
              label="Expire le"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register('expiresAt')}
            />
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Actif"
                />
              )}
            />
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
