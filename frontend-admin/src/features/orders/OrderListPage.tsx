import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, Tab, TextField, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOrders } from './hooks';
import OrderStatusChip from '@/components/OrderStatusChip';
import { usePagination } from '@/hooks/usePagination';
import { formatCurrency, formatDate } from '@/lib/format';
import type { OrderStatus } from '@/types';

const TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Payées', value: 'paid' },
  { label: 'Expédiées', value: 'shipped' },
  { label: 'Livrées', value: 'delivered' },
  { label: 'Annulées', value: 'cancelled' },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const { data: orders = [], isLoading } = useOrders(tab === 'all' ? undefined : tab);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(
      (o) => o.id.toLowerCase().includes(term) || (o.shippingAddress?.fullName ?? '').toLowerCase().includes(term),
    );
  }, [orders, search]);
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(filtered);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 700 }}>
        Commandes
      </Typography>

      <Tabs
        value={tab}
        onChange={(_e, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} label={t.label} value={t.value} />
        ))}
      </Tabs>

      <TextField
        placeholder="Rechercher par n° de commande ou client…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 }, bgcolor: 'background.paper' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Commande</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Client</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Date</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Statut</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Articles</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => navigate(`/commandes/${order.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{order.id.slice(0, 8)}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{order.shippingAddress?.fullName ?? '—'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(order.createdAt)}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{order.items.reduce((sum, i) => sum + i.qty, 0)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(order.total)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Aucune commande
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
