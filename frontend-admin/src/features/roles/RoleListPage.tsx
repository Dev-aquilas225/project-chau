import { useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRoles, useDeleteRole } from './hooks';
import RoleFormDialog from './RoleFormDialog';
import { usePagination } from '@/hooks/usePagination';
import { RESOURCE_KEYS, RESOURCE_LABELS } from '@/types';
import type { CustomRole } from '@/types';

export default function RoleListPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(roles);
  const deleteMutation = useDeleteRole();
  const [dialogState, setDialogState] = useState<{ open: boolean; role: CustomRole | null }>({
    open: false,
    role: null,
  });

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Rôles &amp; permissions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogState({ open: true, role: null })}>
          Nouveau rôle
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Un rôle donne un accès délégué et limité au back-office à un utilisateur qui n'est pas administrateur.
      </Typography>

      <TableContainer sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((role) => (
              <TableRow key={role.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{role.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{role.description || '—'}</TableCell>
                <TableCell>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {RESOURCE_KEYS.filter((r) => (role.permissions[r] ?? 'none') !== 'none').map((r) => (
                      <Chip
                        key={r}
                        size="small"
                        label={`${RESOURCE_LABELS[r]}: ${role.permissions[r] === 'manage' ? 'Gérer' : 'Voir'}`}
                        color={role.permissions[r] === 'manage' ? 'primary' : 'default'}
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setDialogState({ open: true, role })}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm(`Supprimer le rôle "${role.name}" ?`)) deleteMutation.mutate(role.id);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Aucun rôle personnalisé
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

      <RoleFormDialog open={dialogState.open} onClose={() => setDialogState({ open: false, role: null })} role={dialogState.role} />
    </Box>
  );
}
