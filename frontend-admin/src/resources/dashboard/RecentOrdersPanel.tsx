import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslate } from 'react-admin';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order } from '../../types';

export function RecentOrdersPanel({ orders }: { orders: Order[] }) {
  const translate = useTranslate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {translate('app.dashboard.recentOrders')}
        </Typography>
        <List dense>
          {orders.map((order) => (
            <ListItem key={order.id} disableGutters>
              <ListItemText
                primary={`#${order.id.slice(0, 8).toUpperCase()} — ${order.items.length} article(s)`}
                secondary={order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : ''}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                  {Number(order.total).toFixed(2)} €
                </Typography>
                <StatusBadge status={order.status} />
              </Stack>
            </ListItem>
          ))}
        </List>
        <Link component={RouterLink} to="/orders" variant="body2">
          {translate('app.dashboard.viewAllTransactions')}
        </Link>
      </CardContent>
    </Card>
  );
}
