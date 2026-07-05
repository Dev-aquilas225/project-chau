import { useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { usePromoCodes, useDeletePromoCode } from './hooks';
import PromoCodeFormDialog from './PromoCodeFormDialog';
import { useHasPermission } from '@/features/auth/usePermission';
import { usePagination } from '@/hooks/usePagination';
import { formatCurrency, formatDateShort } from '@/lib/format';
import type { PromoCode } from '@/types';

export default function PromoCodeListPage() {
  const canManage = useHasPermission('promoCodes', 'manage');
  const { data: promoCodes = [], isLoading } = usePromoCodes();
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(promoCodes);
  const deleteMutation = useDeletePromoCode();
  const [dialogState, setDialogState] = useState<{ open: boolean; promoCode: PromoCode | null }>({
    open: false,
    promoCode: null,
  });

  const isExpired = (code: PromoCode) => !!code.expiresAt && new Date(code.expiresAt) < new Date();

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Codes promo</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogState({ open: true, promoCode: null })}>
            Nouveau code
          </Button>
        )}
      </Stack>

      <TableContainer sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Réduction</TableCell>
              <TableCell>Montant min.</TableCell>
              <TableCell>Expiration</TableCell>
              <TableCell>Statut</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((code) => (
              <TableRow key={code.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{code.code}</TableCell>
                <TableCell>
                  {code.discountType === 'percentage' ? `${code.discountValue}%` : formatCurrency(code.discountValue)}
                </TableCell>
                <TableCell>{code.minAmount > 0 ? formatCurrency(code.minAmount) : '—'}</TableCell>
                <TableCell>{code.expiresAt ? formatDateShort(code.expiresAt) : '—'}</TableCell>
                <TableCell>
                  {isExpired(code) ? (
                    <Chip size="small" label="Expiré" color="default" />
                  ) : (
                    <Chip size="small" label={code.active ? 'Actif' : 'Inactif'} color={code.active ? 'success' : 'default'} />
                  )}
                </TableCell>
                {canManage && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setDialogState({ open: true, promoCode: code })}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm(`Supprimer le code "${code.code}" ?`)) deleteMutation.mutate(code.id);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isLoading && promoCodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Aucun code promo
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

      <PromoCodeFormDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, promoCode: null })}
        promoCode={dialogState.promoCode}
      />
    </Box>
  );
}
