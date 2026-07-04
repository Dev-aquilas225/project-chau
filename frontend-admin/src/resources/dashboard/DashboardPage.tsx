import { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon from '@mui/icons-material/Groups';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Title, useGetList, useTranslate } from 'react-admin';
import { KpiCard } from '../../components/KpiCard';
import { PageContainer } from '../../components/PageContainer';
import { customDataProvider, type DashboardStats } from '../../dataProvider';
import type { Order } from '../../types';
import { RecentOrdersPanel } from './RecentOrdersPanel';
import { RecentSellerApplicationsTable } from './RecentSellerApplicationsTable';
import { SalesGrowthChart } from './SalesGrowthChart';

export function DashboardPage() {
  const translate = useTranslate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    customDataProvider.getDashboardStats().then(setStats);
  }, []);

  const { total: activeSellers } = useGetList('sellers', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'createdAt', order: 'DESC' },
    filter: { status: 'approved' },
  });

  const { data: orders } = useGetList<Order>('orders', {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: 'createdAt', order: 'ASC' },
    filter: {},
  });

  const monthlyGmv = useMemo(() => {
    if (!orders) return 0;
    const now = new Date();
    const paidStatuses = ['paid', 'shipped', 'delivered'];
    return orders
      .filter((o) => {
        if (!o.createdAt || !paidStatuses.includes(o.status)) return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, o) => sum + Number(o.total), 0);
  }, [orders]);

  return (
    <PageContainer title={translate('app.dashboard.title')}>
      <Title title={translate('app.dashboard.title')} />

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <KpiCard
          icon={AccountBalanceWalletIcon}
          label={translate('app.dashboard.totalRevenue')}
          value={`${(stats?.totalRevenue ?? 0).toFixed(2)} €`}
          hint={translate('app.dashboard.totalRevenueHint')}
        />
        <KpiCard
          icon={GroupsIcon}
          label={translate('app.dashboard.activeSellers')}
          value={String(activeSellers ?? 0)}
          hint={translate('app.dashboard.activeSellersHint')}
        />
        <KpiCard
          icon={HourglassTopIcon}
          label={translate('app.dashboard.pendingApplications')}
          value={String(stats?.pendingSellerCount ?? 0)}
          hint={translate('app.dashboard.pendingApplicationsHint')}
          urgent={(stats?.pendingSellerCount ?? 0) > 0}
        />
        <KpiCard
          icon={TrendingUpIcon}
          label={translate('app.dashboard.monthlyGmv')}
          value={`${monthlyGmv.toFixed(2)} €`}
          hint={translate('app.dashboard.monthlyGmvHint')}
        />
      </Stack>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SalesGrowthChart />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RecentOrdersPanel orders={stats?.recentOrders as Order[] | undefined ?? []} />
        </Grid>
        <Grid size={12}>
          <RecentSellerApplicationsTable />
        </Grid>
      </Grid>
    </PageContainer>
  );
}
