import Chip from '@mui/material/Chip';
import { colors } from '../theme/tokens';

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  approved: { label: 'Approuvé', color: colors.statusApproved },
  paid: { label: 'Payé', color: colors.statusApproved },
  delivered: { label: 'Livré', color: colors.statusApproved },
  shipped: { label: 'Expédié', color: colors.statusApproved },
  active: { label: 'Actif', color: colors.statusApproved },
  pending: { label: 'En attente', color: colors.statusPending },
  processing: { label: 'En traitement', color: colors.statusPending },
  draft: { label: 'Brouillon', color: colors.statusPending },
  rejected: { label: 'Rejeté', color: colors.statusRejected },
  cancelled: { label: 'Annulé', color: colors.statusRejected },
  archived: { label: 'Archivé', color: colors.statusRejected },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { label: status, color: '#6B7280' };
  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        backgroundColor: `${style.color}1A`,
        color: style.color,
        fontWeight: 600,
        borderRadius: '8px',
      }}
    />
  );
}
