import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Show, SimpleShowLayout, useRecordContext } from 'react-admin';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order } from '../../types';
import { OrderStatusUpdateButton } from './OrderStatusUpdateButton';

// ===== COMPOSANTS INTERNES =====

function OrderSummary({ order }: { order: Order }) {
  return (
    <Stack spacing={0.5} sx={{ maxWidth: 280 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">Sous-total</Typography>
        <Typography variant="body2">{Number(order.subtotal).toFixed(2)} €</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">Remise</Typography>
        <Typography variant="body2">-{Number(order.discount).toFixed(2)} €</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" fontWeight={700}>
          Total
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {Number(order.total).toFixed(2)} €
        </Typography>
      </Stack>
    </Stack>
  );
}

function OrderItemsList({ items }: { items: Order['items'] }) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Articles
      </Typography>
      <List dense>
        {items.map((item) => (
          <ListItem key={item.productId} disableGutters>
            <ListItemText
              primary={`${item.brand} — ${item.name}`}
              secondary={`Qté ${item.qty} × ${Number(item.unitPrice).toFixed(2)} €`}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

function OrderHistory({ history }: { history: Order['statusHistory'] }) {
  if (!history || history.length === 0) return null;

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">Historique</Typography>
      <List dense>
        {history.map((entry) => (
          <ListItem key={entry.id} disableGutters>
            <ListItemText
              primary={<StatusBadge status={entry.status} />}
              secondary={`${new Date(entry.createdAt).toLocaleString('fr-FR')}${
                entry.note ? ` — ${entry.note}` : ''
              }`}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

function OrderHeader({ order }: { order: Order }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography variant="h6">Commande #{order.id.slice(0, 8)}</Typography>
        <StatusBadge status={order.status} />
      </Box>
      <OrderStatusUpdateButton order={order} />
    </Stack>
  );
}

// ===== COMPOSANT PRINCIPAL =====

function OrderDetails() {
  const record = useRecordContext<Order>();
  if (!record) return null;

  return (
    <Box>
      <OrderHeader order={record} />
      <OrderItemsList items={record.items} />
      <Divider sx={{ my: 2 }} />
      <OrderSummary order={record} />
      <OrderHistory history={record.statusHistory} />
    </Box>
  );
}

export function OrderShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <OrderDetails />
      </SimpleShowLayout>
    </Show>
  );
}