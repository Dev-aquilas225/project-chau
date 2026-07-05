import { Chip } from '@mui/material';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error' }> = {
  pending: { label: 'En attente', color: 'warning' },
  paid: { label: 'Payée', color: 'info' },
  shipped: { label: 'Expédiée', color: 'primary' },
  delivered: { label: 'Livrée', color: 'success' },
  cancelled: { label: 'Annulée', color: 'error' },
};

export default function OrderStatusChip({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return <Chip size="small" label={config.label} color={config.color} variant="filled" />;
}
