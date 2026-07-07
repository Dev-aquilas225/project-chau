import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useUsers, useUpdateUserRole, useAssignCustomRole, useDeleteUser } from './hooks';
import { useRoles } from '@/features/roles/hooks';
import UserFormDialog from './UserFormDialog';
import { useAuth } from '@/features/auth/AuthProvider';
import { useHasAnyPermission } from '@/features/auth/usePermission';
import { useConfirm } from '@/components/ConfirmDialogProvider';
import { usePagination } from '@/hooks/usePagination';
import { formatDateShort } from '@/lib/format';
import type { Role, UserProfile } from '@/types';

export default function UserListPage() {
  const confirm = useConfirm();
  const { user: currentUser, role: currentRole } = useAuth();
  const canManageUsers = useHasAnyPermission('users', ['create', 'update', 'delete']);
  const isNativeAdmin = currentRole === 'admin';
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const updateRoleMutation = useUpdateUserRole();
  const assignCustomRoleMutation = useAssignCustomRole();
  const deleteMutation = useDeleteUser();
  const [search, setSearch] = useState('');
  const [dialogState, setDialogState] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null,
  });

  const customRoles = roles.filter((r) => !r.isSystem);

  const filtered = users.filter((u) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return u.email.toLowerCase().includes(term) || u.displayName.toLowerCase().includes(term);
  });
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(filtered);

  const handleRoleChange = async (u: UserProfile, value: string) => {
    const isNative = value === 'admin' || value === 'customer';
    const label = isNative ? value : (roles.find((r) => r.id === value)?.name ?? value);
    if (!(await confirm(`Changer le rôle de ${u.displayName} en "${label}" ?`))) return;

    if (isNative) {
      if (u.customRoleId) assignCustomRoleMutation.mutate({ id: u.id, roleId: null });
      if (u.role !== value) updateRoleMutation.mutate({ id: u.id, role: value as Role });
    } else {
      assignCustomRoleMutation.mutate({ id: u.id, roleId: value });
      if (u.role !== 'customer') updateRoleMutation.mutate({ id: u.id, role: 'customer' });
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Utilisateurs</Typography>
        {canManageUsers && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogState({ open: true, user: null })}>
            Nouvel utilisateur
          </Button>
        )}
      </Stack>

      <TextField
        placeholder="Rechercher par nom ou email…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 320, bgcolor: 'background.paper' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      <TableContainer sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vendeur</TableCell>
              <TableCell>Inscrit le</TableCell>
              <TableCell>Rôle</TableCell>
              {canManageUsers && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((u) => {
              const currentValue = u.customRoleId ?? u.role;
              const isSelf = u.id === currentUser?.id;
              return (
                <TableRow key={u.id} hover>
                  <TableCell>{u.displayName}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                  <TableCell>
                    {u.sellerStatus !== 'none' && (
                      <Chip
                        size="small"
                        label={u.sellerStatus}
                        color={u.sellerStatus === 'approved' ? 'success' : u.sellerStatus === 'pending' ? 'warning' : 'default'}
                      />
                    )}
                  </TableCell>
                  <TableCell>{formatDateShort(u.createdAt)}</TableCell>
                  <TableCell>
                    {canManageUsers ? (
                      <Select
                        size="small"
                        value={currentValue}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        sx={{ minWidth: 170 }}
                      >
                        <MenuItem value="admin" disabled={!isNativeAdmin}>Admin</MenuItem>
                        <MenuItem value="customer" disabled={!isNativeAdmin}>Client</MenuItem>
                        {customRoles.map((r) => (
                          <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip size="small" label={u.customRole?.name ?? u.role} />
                    )}
                  </TableCell>
                  {canManageUsers && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setDialogState({ open: true, user: u })}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={isSelf}
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Supprimer l'utilisateur "${u.displayName}" ?`,
                            description: 'Ses commandes, avis et favoris seront aussi supprimés.',
                            destructive: true,
                          });
                          if (ok) {
                            deleteMutation.mutate(u.id);
                          }
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManageUsers ? 6 : 5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>

      <UserFormDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, user: null })}
        user={dialogState.user}
      />
    </Box>
  );
}
