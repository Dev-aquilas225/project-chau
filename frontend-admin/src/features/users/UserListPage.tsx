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
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useUsers, useUpdateUserRole } from './hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatDateShort } from '@/lib/format';
import type { Role } from '@/types';

export default function UserListPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return u.email.toLowerCase().includes(term) || u.displayName.toLowerCase().includes(term);
  });

  const handleRoleChange = (id: string, role: Role, displayName: string) => {
    if (confirm(`Changer le rôle de ${displayName} en "${role}" ?`)) {
      updateRoleMutation.mutate({ id, role });
    }
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
              <TableCell align="right">Rôle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((u) => (
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
                <TableCell align="right">
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
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
