import { Box, Stack, Typography } from '@mui/material';
import { formatCurrency } from '@/lib/format';

interface RankingItem {
  key: string;
  label: string;
  value: number;
}

interface TopRankingListProps {
  items: RankingItem[];
  emptyLabel: string;
}

export default function TopRankingList({ items, emptyLabel }: TopRankingListProps) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyLabel}
      </Typography>
    );
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Box key={item.key}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
              {item.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(item.value)}
            </Typography>
          </Stack>
          <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.max((item.value / max) * 100, 4)}%`,
                bgcolor: '#0288d1',
                borderRadius: 999,
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
