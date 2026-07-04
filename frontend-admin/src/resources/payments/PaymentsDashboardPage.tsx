import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import UndoIcon from '@mui/icons-material/Undo';
import { Title, useGetList } from 'react-admin';
import { KpiCard } from '../../components/KpiCard';
import { PageContainer } from '../../components/PageContainer';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order, OrderStatus } from '../../types';

const PAID_STATUSES = ['paid', 'shipped', 'delivered'];
const METHOD_LABEL: Record<string, string> = { card: 'Carte bancaire', paypal: 'PayPal', klarna: 'Klarna' };
const STATUS_CHOICES: { id: OrderStatus; name: string }[] = [
  { id: 'pending', name: 'En attente' },
  { id: 'paid', name: 'Payé' },
  { id: 'shipped', name: 'Expédié' },
  { id: 'delivered', name: 'Livré' },
  { id: 'cancelled', name: 'Annulé' },
];

export function PaymentsDashboardPage() {
  const { data, isPending } = useGetList<Order>('orders', {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: 'createdAt', order: 'DESC' },
    filter: {},
  });

  const orders = data ?? [];
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const filteredOrders = useMemo(
    () =>
      orders
        .filter((o) => (methodFilter ? o.paymentMethod === methodFilter : true))
        .filter((o) => (statusFilter ? o.status === statusFilter : true)),
    [orders, methodFilter, statusFilter],
  );

  const { revenue, refunds, byMethod, settledCount } = useMemo(() => {
    const settled = orders.filter((o) => PAID_STATUSES.includes(o.status));
    const revenue = settled.reduce((sum, o) => sum + Number(o.total), 0);
    const refunds = orders
      .filter((o) => o.status === 'cancelled')
      .reduce((sum, o) => sum + Number(o.total), 0);
    const byMethod = settled.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
      const method = o.paymentMethod || 'inconnu';
      acc[method] = acc[method] || { count: 0, total: 0 };
      acc[method].count += 1;
      acc[method].total += Number(o.total);
      return acc;
    }, {});
    return { revenue, refunds, byMethod, settledCount: settled.length };
  }, [orders]);

  return (
    <PageContainer title="Paiements (monétique)">
      <Title title="Paiements" />

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <KpiCard icon={PaymentIcon} label="Encaissé" value={`${revenue.toFixed(2)} €`} hint="Commandes payées, expédiées ou livrées" />
        <KpiCard icon={ReceiptIcon} label="Transactions" value={String(settledCount)} hint="Nombre de commandes réglées" />
        <KpiCard icon={UndoIcon} label="Remboursé (annulé)" value={`${refunds.toFixed(2)} €`} hint="Commandes annulées" />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2, flexWrap: 'wrap' }}>
        {Object.entries(byMethod).map(([method, v]) => (
          <Card key={method} sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography variant="body2" fontWeight={600}>
                {METHOD_LABEL[method] ?? method}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {v.count} transaction(s)
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {v.total.toFixed(2)} €
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          size="small"
          label="Moyen de paiement"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tous</MenuItem>
          {Object.keys(METHOD_LABEL).map((method) => (
            <MenuItem key={method} value={method}>
              {METHOD_LABEL[method]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Statut"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tous</MenuItem>
          {STATUS_CHOICES.map((choice) => (
            <MenuItem key={choice.id} value={choice.id}>
              {choice.name}
            </MenuItem>
          ))}
        </TextField>
        {methodFilter && (
          <Chip label={`Moyen : ${METHOD_LABEL[methodFilter]}`} size="small" onDelete={() => setMethodFilter('')} />
        )}
        {statusFilter && (
          <Chip
            label={`Statut : ${STATUS_CHOICES.find((c) => c.id === statusFilter)?.name}`}
            size="small"
            onDelete={() => setStatusFilter('')}
          />
        )}
      </Stack>

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Transaction</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Moyen</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isPending &&
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 10).toUpperCase()}</TableCell>
                  <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}</TableCell>
                  <TableCell>{METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</TableCell>
                  <TableCell>{Number(order.total).toFixed(2)} €</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Vue construite à partir des commandes. L'intégration d'un prestataire de paiement réel (Stripe, Adyen…) se
        fait côté serveur — aucun secret de paiement ne transite par le frontend.
      </Typography>
    </PageContainer>
  );
}
