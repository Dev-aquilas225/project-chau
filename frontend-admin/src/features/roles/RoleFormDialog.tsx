import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCreateRole, useUpdateRole } from './hooks';
import { RESOURCE_KEYS, RESOURCE_LABELS, PERMISSION_ACTIONS, ACTION_LABELS } from '@/types';
import type { CustomRole, PermissionAction, ResourceKey } from '@/types';

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  role: CustomRole | null;
}

interface FormValues {
  name: string;
  description: string;
}

export default function RoleFormDialog({ open, onClose, role }: RoleFormDialogProps) {
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const [permissions, setPermissions] = useState<Partial<Record<ResourceKey, PermissionAction[]>>>({});
  const isSystem = role?.isSystem ?? false;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    values: { name: role?.name ?? '', description: role?.description ?? '' },
  });

  useEffect(() => {
    setPermissions(role?.permissions ?? {});
  }, [role, open]);

  const toggleAction = (resource: ResourceKey, action: PermissionAction, checked: boolean) => {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const next = checked ? [...new Set([...current, action])] : current.filter((a) => a !== action);
      return { ...prev, [resource]: next };
    });
  };

  const toggleAllForResource = (resource: ResourceKey, checked: boolean) => {
    setPermissions((prev) => ({ ...prev, [resource]: checked ? [...PERMISSION_ACTIONS] : [] }));
  };

  const onSubmit = async (values: FormValues) => {
    const input = { name: values.name, description: values.description || undefined, permissions };
    if (role) {
      await updateMutation.mutateAsync({ id: role.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{role ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5, mb: 3 }}>
            <TextField
              label="Nom du rôle"
              fullWidth
              disabled={isSystem}
              helperText={isSystem ? 'Rôle de base : le nom ne peut pas être modifié.' : errors.name?.message}
              {...register('name', { required: 'Le nom est requis' })}
              error={!!errors.name}
            />
            <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ressource</TableCell>
                {PERMISSION_ACTIONS.map((action) => (
                  <TableCell key={action} align="center">{ACTION_LABELS[action]}</TableCell>
                ))}
                <TableCell align="center">Tout</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {RESOURCE_KEYS.map((resource) => {
                const granted = permissions[resource] ?? [];
                const allChecked = granted.length === PERMISSION_ACTIONS.length;
                return (
                  <TableRow key={resource}>
                    <TableCell>{RESOURCE_LABELS[resource]}</TableCell>
                    {PERMISSION_ACTIONS.map((action) => (
                      <TableCell key={action} align="center" sx={{ p: 0.5 }}>
                        <Checkbox
                          size="small"
                          checked={granted.includes(action)}
                          onChange={(e) => toggleAction(resource, action, e.target.checked)}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ p: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={allChecked}
                        indeterminate={granted.length > 0 && !allChecked}
                        onChange={(e) => toggleAllForResource(resource, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {isSystem && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Ce rôle de base peut avoir ses permissions ajustées, mais ne peut pas être renommé ni supprimé.
            </Typography>
          )}
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
