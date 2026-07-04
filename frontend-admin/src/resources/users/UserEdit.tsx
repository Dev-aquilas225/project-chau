import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Edit, useNotify, useRecordContext, useRedirect, useRefresh } from 'react-admin';
import { customDataProvider } from '../../dataProvider';
import type { Role, UserProfile } from '../../types';

function RoleForm() {
  const record = useRecordContext<UserProfile>();
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const [role, setRole] = useState<Role>(record?.role ?? 'customer');

  if (!record) return null;

  const save = async () => {
    try {
      await customDataProvider.updateUserRole(record.id, role);
      notify('Rôle mis à jour.', { type: 'success' });
      refresh();
      redirect('list', 'users');
    } catch {
      notify('Échec de la mise à jour du rôle.', { type: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6">{record.displayName}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {record.email}
      </Typography>
      <Stack spacing={2}>
        <TextField select label="Rôle" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <MenuItem value="customer">Client</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
        <Button variant="contained" disabled={role === record.role} onClick={save} sx={{ alignSelf: 'flex-start' }}>
          Enregistrer
        </Button>
      </Stack>
    </Box>
  );
}

export function UserEdit() {
  return (
    <Edit>
      <RoleForm />
    </Edit>
  );
}
