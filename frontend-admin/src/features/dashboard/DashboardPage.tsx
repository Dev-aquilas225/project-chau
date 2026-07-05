import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from './hooks';
import StatCard from './components/StatCard';
import OrderStatusChip from '@/components/OrderStatusChip';
import { formatCurrency, formatDate } from '@/lib/format';
import type { OrderStatus } from '@/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payées',
  shipped: 'Expédiées',
  delivered: 'Livrées',
  cancelled: 'Annulées',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Chiffre d'affaires" value={formatCurrency(data.totalRevenue)} icon={<EuroOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Commandes" value={String(data.totalOrders)} icon={<ReceiptLongOutlinedIcon />} accent="#1565c0" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Rupture de stock"
            value={String(data.outOfStockProducts)}
            icon={<WarningAmberOutlinedIcon />}
            accent="#b71c1c"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Vendeurs en attente"
            value={String(data.pendingSellerCount)}
            icon={<StorefrontOutlinedIcon />}
            accent="#6b21a8"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Commandes par statut
              </Typography>
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
                <Box
                  key={status}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}
                >
                  <OrderStatusChip status={status} />
                  <Typography variant="body1" fontWeight={600}>
                    {data.ordersByStatus[status] ?? 0}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Commandes récentes
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Commande</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        onClick={() => navigate(`/commandes/${order.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace' }}>{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <OrderStatusChip status={order.status} />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                      </TableRow>
                    ))}
                    {data.recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                          Aucune commande pour le moment
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
