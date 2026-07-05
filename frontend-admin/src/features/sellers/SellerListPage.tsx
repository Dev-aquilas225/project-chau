import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Typography, CircularProgress } from '@mui/material';
import { useSellers } from './hooks';
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
  const { data: sellers = [], isLoading } = useSellers(tab === 'all' ? undefined : tab);

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
              {sellers.map((seller) => (
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
                    <Chip size="small" label={seller.sellerStatus} color={STATUS_COLOR[seller.sellerStatus]} />
                  </TableCell>
                </TableRow>
              ))}
              {sellers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Aucune candidature
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
