import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useCreateRole, useUpdateRole } from './hooks';
import { RESOURCE_KEYS, RESOURCE_LABELS } from '@/types';
import type { CustomRole, PermissionLevel, ResourceKey } from '@/types';

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
  const [permissions, setPermissions] = useState<Partial<Record<ResourceKey, PermissionLevel>>>({});

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    values: { name: role?.name ?? '', description: role?.description ?? '' },
  });

  useEffect(() => {
    setPermissions(role?.permissions ?? {});
  }, [role, open]);

  const setLevel = (resource: ResourceKey, level: PermissionLevel | null) => {
    setPermissions((prev) => ({ ...prev, [resource]: level ?? 'none' }));
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{role ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5, mb: 3 }}>
            <TextField
              label="Nom du rôle"
              fullWidth
              {...register('name', { required: 'Le nom est requis' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ressource</TableCell>
                <TableCell align="right">Niveau d'accès</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {RESOURCE_KEYS.map((resource) => (
                <TableRow key={resource}>
                  <TableCell>{RESOURCE_LABELS[resource]}</TableCell>
                  <TableCell align="right">
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={permissions[resource] ?? 'none'}
                      onChange={(_e, value) => setLevel(resource, value)}
                    >
                      <ToggleButton value="none">Aucun</ToggleButton>
                      <ToggleButton value="view">Voir</ToggleButton>
                      <ToggleButton value="manage">Gérer</ToggleButton>
                    </ToggleButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
