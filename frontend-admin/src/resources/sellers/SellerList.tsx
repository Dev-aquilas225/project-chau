import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import jsonExport from 'jsonexport/dist';
import {
  Datagrid,
  downloadCSV,
  ExportButton,
  FunctionField,
  ListBase,
  Pagination,
  TopToolbar,
  useGetList,
  useListContext,
  useTranslate,
} from 'react-admin';
import { PageContainer } from '../../components/PageContainer';
import { StatusBadge } from '../../components/StatusBadge';
import type { UserProfile } from '../../types';
import { SellerApproveRejectButtons } from './SellerActions';
import { useSellerFinances } from './useSellerFinances';

type StatusTab = 'all' | 'pending' | 'approved' | 'rejected';

const SELLER_EXPORT_FIELDS = ['id', 'email', 'displayName', 'sellerStatus', 'createdAt'] as const;

// PII (IBAN, ID number, ID document refs) is deliberately excluded from the
// exported CSV — only the whitelisted fields below are ever written out.
function sellerExporter(records: UserProfile[]) {
  const rows = records.map((record) => {
    const row: Record<string, unknown> = {};
    for (const field of SELLER_EXPORT_FIELDS) row[field] = record[field];
    row.storeName = record.sellerProfile?.storeName ?? '';
    return row;
  });
  jsonExport(rows, (_err: Error | null, csv: string) => downloadCSV(csv, 'vendeurs'));
}

function SellerListToolbar() {
  const translate = useTranslate();
  return (
    <TopToolbar>
      <Button size="small" startIcon={<PersonAddIcon />} disabled>
        {translate('app.sellers.invite')} ({translate('app.sellers.comingSoon')})
      </Button>
      <ExportButton label={translate('app.sellers.exportList')} />
    </TopToolbar>
  );
}

function SellerListBody() {
  const { data, total, isPending } = useListContext<UserProfile>();
  const { bySeller } = useSellerFinances();

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', overflow: 'hidden' }}>
      <Datagrid data={data} isPending={isPending} total={total} bulkActionButtons={false} rowClick="show">
        <FunctionField
          label="Vendeur"
          render={(record: UserProfile) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={record.photoURL} sx={{ width: 32, height: 32 }}>
                {record.displayName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2">{record.displayName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {record.email}
                </Typography>
              </Box>
            </Stack>
          )}
        />
        <FunctionField
          label="Détails boutique"
          render={(record: UserProfile) => (
            <Box>
              <Typography variant="body2">{record.sellerProfile?.storeName || '—'}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 240, display: 'block' }}>
                {record.sellerProfile?.bio || ''}
              </Typography>
            </Box>
          )}
        />
        <FunctionField
          label="Statut"
          render={(record: UserProfile) => <StatusBadge status={record.sellerStatus ?? 'none'} />}
        />
        <FunctionField
          label="Finances"
          render={(record: UserProfile) => {
            const finances = bySeller.get(record.id);
            return (
              <Typography variant="body2">
                Revenu {(finances?.revenue ?? 0).toFixed(2)} € / Payout {(finances?.payout ?? 0).toFixed(2)} €
              </Typography>
            );
          }}
        />
        <FunctionField
          label="Actions"
          render={(record: UserProfile) => <SellerApproveRejectButtons record={record} />}
        />
      </Datagrid>
      <Pagination />
    </Box>
  );
}

export function SellerList() {
  const translate = useTranslate();
  const [tab, setTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const { total: pendingCount } = useGetList<UserProfile>('sellers', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'createdAt', order: 'DESC' },
    filter: { status: 'pending' },
  });

  const filter = {
    ...(tab === 'all' ? {} : { status: tab }),
    ...(search ? { q: search } : {}),
  };

  return (
    <PageContainer title={translate('app.sellers.title')} subtitle={translate('app.sellers.subtitle')} actions={<SellerListToolbar />}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 1 }}>
        <Tab label={translate('app.sellers.tabAll')} value="all" />
        <Tab label={`${translate('app.sellers.tabPending')} (${pendingCount ?? 0})`} value="pending" />
        <Tab label={translate('app.sellers.tabApproved')} value="approved" />
        <Tab label={translate('app.sellers.tabRejected')} value="rejected" />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
        <TextField
          size="small"
          placeholder="Rechercher un vendeur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {translate('app.sellers.sortRecent')}
        </Typography>
      </Box>

      <ListBase
        resource="sellers"
        filter={filter}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={10}
        exporter={sellerExporter}
        disableSyncWithLocation
      >
        <SellerListBody />
      </ListBase>
    </PageContainer>
  );
}
