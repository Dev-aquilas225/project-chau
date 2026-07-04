import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import { colors } from '../theme/tokens';

interface KpiCardProps {
  icon: SvgIconComponent;
  label: string;
  value: string;
  hint: string;
  delta?: { value: string; positive: boolean };
  urgent?: boolean;
}

export function KpiCard({ icon: Icon, label, value, hint, delta, urgent }: KpiCardProps) {
  return (
    <Card sx={{ flex: 1, minWidth: 230 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colors.primary}14`,
              color: colors.primary,
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        </Stack>
        <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
          <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
            {value}
          </Typography>
          {delta && (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: delta.positive ? colors.statusApproved : colors.statusRejected }}
            >
              {delta.value}
            </Typography>
          )}
          {urgent && <Chip label="URGENT" size="small" color="error" sx={{ fontWeight: 700, fontSize: 10 }} />}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}
