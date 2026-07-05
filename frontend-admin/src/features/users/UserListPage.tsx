import { useState } from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Select,
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
import SearchIcon from '@mui/icons-material/Search';
import { useUsers, useUpdateUserRole, useAssignCustomRole } from './hooks';
import { useRoles } from '@/features/roles/hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { useHasPermission } from '@/features/auth/usePermission';
import { usePagination } from '@/hooks/usePagination';
import { formatDateShort } from '@/lib/format';
import type { Role } from '@/types';

export default function UserListPage() {
  const { user: currentUser, role: currentRole } = useAuth();
  const canManageUsers = useHasPermission('users', 'manage');
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const updateRoleMutation = useUpdateUserRole();
  const assignCustomRoleMutation = useAssignCustomRole();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return u.email.toLowerCase().includes(term) || u.displayName.toLowerCase().includes(term);
  });
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(filtered);

  const handleRoleChange = (id: string, role: Role, displayName: string) => {
    if (confirm(`Changer le rôle de ${displayName} en "${role}" ?`)) {
      updateRoleMutation.mutate({ id, role });
    }
  };

  const handleCustomRoleChange = (id: string, roleId: string | null) => {
    assignCustomRoleMutation.mutate({ id, roleId });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Utilisateurs
      </Typography>

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
              <TableCell>Rôle personnalisé</TableCell>
              <TableCell align="right">Rôle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((u) => (
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
                      value={u.customRole?.id ?? ''}
                      disabled={u.role === 'admin'}
                      onChange={(e) => handleCustomRoleChange(u.id, e.target.value || null)}
                      displayEmpty
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value="">Aucun</MenuItem>
                      {roles.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    (u.customRole?.name ?? '—')
                  )}
                </TableCell>
                <TableCell align="right">
                  {currentRole === 'admin' ? (
                    <Select
                      size="small"
                      value={u.role}
                      disabled={u.id === currentUser?.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role, u.displayName)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="customer">customer</MenuItem>
                      <MenuItem value="admin">admin</MenuItem>
                    </Select>
                  ) : (
                    <Chip size="small" label={u.role} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
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
    </Box>
  );
}
