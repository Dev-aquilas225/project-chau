import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, Tab, TextField, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSellers } from './hooks';
import { usePagination } from '@/hooks/usePagination';
import { formatDateShort } from '@/lib/format';
import type { SellerStatus } from '@/types';

const TABS: { label: string; value: SellerStatus | 'all' }[] = [
  { label: 'En attente', value: 'pending' },
  { label: 'Approuvés', value: 'approved' },
  { label: 'Rejetés', value: 'rejected' },
  { label: 'Tous', value: 'all' },
];

const STATUS_COLOR: Record<SellerStatus, 'default' | 'warning' | 'success' | 'error'> = {
  none: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function SellerListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SellerStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const { data: sellers = [], isLoading } = useSellers(tab === 'all' ? undefined : tab);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sellers;
    return sellers.filter(
      (s) =>
        (s.sellerProfile.storeName ?? '').toLowerCase().includes(term) ||
        s.displayName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term),
    );
  }, [sellers, search]);
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(filtered);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Vendeurs
      </Typography>

      <Tabs value={tab} onChange={(_e, value) => setTab(value)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.value} label={t.label} value={t.value} />
        ))}
      </Tabs>

      <TextField
        placeholder="Rechercher par boutique, nom ou email…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 320, bgcolor: 'background.paper' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Boutique</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Soumis le</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((seller) => (
                <TableRow key={seller.id} hover onClick={() => navigate(`/vendeurs/${seller.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{seller.sellerProfile.storeName || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{seller.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {seller.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{seller.sellerProfile.submittedAt ? formatDateShort(seller.sellerProfile.submittedAt) : '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={seller.sellerStatus} color={STATUS_COLOR[seller.sellerStatus]} sx={{ mr: 0.5 }} />
                    {seller.blocked && <Chip size="small" label="Bloqué" color="error" />}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Aucune candidature
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
      )}
    </Box>
  );
}
