import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useOrder, useUpdateOrderStatus } from './hooks';
import OrderStatusChip from '@/components/OrderStatusChip';
import { formatCurrency, formatDate } from '@/lib/format';
import type { OrderStatus } from '@/types';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus();
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');

  if (isLoading || !order) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleUpdateStatus = async () => {
    if (!id || !nextStatus) return;
    await updateStatusMutation.mutateAsync({ id, status: nextStatus, note: note.trim() || undefined });
    setNote('');
    setNextStatus('');
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/commandes')} sx={{ color: 'text.secondary', mb: 1.5 }}>
        Retour
      </Button>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4">Commande #{order.id.slice(0, 8)}</Typography>
        <OrderStatusChip status={order.status} />
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Articles
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell align="right">Prix unitaire</TableCell>
                    <TableCell align="right">Qté</TableCell>
                    <TableCell align="right">Sous-total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, i) => (
                    <TableRow key={`${item.productId}-${i}`}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>
                        {item.brand && (
                          <Typography variant="caption" color="text.secondary">
                            {item.brand}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{item.qty}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice * item.qty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={0.75} alignItems="flex-end">
                <Stack direction="row" justifyContent="space-between" sx={{ width: 240 }}>
                  <Typography variant="body2" color="text.secondary">Sous-total</Typography>
                  <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                </Stack>
                {order.discount > 0 && (
                  <Stack direction="row" justifyContent="space-between" sx={{ width: 240 }}>
                    <Typography variant="body2" color="text.secondary">
                      Remise {order.promoCode ? `(${order.promoCode})` : ''}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{formatCurrency(order.discount)}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between" sx={{ width: 240 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>{formatCurrency(order.total)}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Historique du statut
              </Typography>
              <Stack spacing={1.5}>
                {(order.statusHistory ?? []).map((entry) => (
                  <Stack key={entry.id} direction="row" spacing={2} alignItems="center">
                    <OrderStatusChip status={entry.status} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(entry.createdAt)}
                    </Typography>
                    {entry.note && <Typography variant="body2">— {entry.note}</Typography>}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2.5}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Adresse de livraison
                </Typography>
                <Typography variant="body2">{order.shippingAddress.fullName}</Typography>
                <Typography variant="body2">{order.shippingAddress.line1}</Typography>
                <Typography variant="body2">
                  {order.shippingAddress.zip} {order.shippingAddress.city}
                </Typography>
                <Typography variant="body2">{order.shippingAddress.country}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Paiement : {order.paymentMethod}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Changer le statut
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Nouveau statut"
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                    fullWidth
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Note (optionnel)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <Button
                    variant="contained"
                    disabled={!nextStatus || updateStatusMutation.isPending}
                    onClick={handleUpdateStatus}
                  >
                    Mettre à jour
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
