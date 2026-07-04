import { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetList, useTranslate } from 'react-admin';
import { colors } from '../../theme/tokens';
import type { Order } from '../../types';

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function SalesGrowthChart() {
  const translate = useTranslate();
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const { data } = useGetList<Order>('orders', {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: 'createdAt', order: 'ASC' },
    filter: {},
  });

  const chartData = useMemo(() => {
    const orders = data ?? [];
    const buckets = new Map<string, { ventes: number; commissions: number }>();
    const now = new Date();
    for (let i = rangeDays - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets.set(dayKey(d), { ventes: 0, commissions: 0 });
    }
    for (const order of orders) {
      if (!order.createdAt) continue;
      const key = dayKey(new Date(order.createdAt));
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.ventes += Number(order.total) || 0;
      bucket.commissions += Number(order.platformFee) || 0;
    }
    return Array.from(buckets.entries()).map(([date, values]) => ({
      date: date.slice(5),
      ...values,
    }));
  }, [data, rangeDays]);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{translate('app.dashboard.salesChartTitle')}</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={rangeDays}
            onChange={(_, value) => value && setRangeDays(value)}
          >
            <ToggleButton value={7}>{translate('app.dashboard.last7Days')}</ToggleButton>
            <ToggleButton value={30}>{translate('app.dashboard.last30Days')}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ventes" name={translate('app.dashboard.sales')} fill={colors.primary} />
            <Bar dataKey="commissions" name={translate('app.dashboard.commissions')} fill={colors.primaryLight} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
