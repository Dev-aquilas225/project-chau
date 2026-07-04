import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useGetList, useNotify, useTranslate } from 'react-admin';
import { StatusBadge } from '../../components/StatusBadge';
import { customDataProvider } from '../../dataProvider';
import type { UserProfile } from '../../types';

export function RecentSellerApplicationsTable() {
  const translate = useTranslate();
  const notify = useNotify();
  const { data, total, refetch } = useGetList<UserProfile>('sellers', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'createdAt', order: 'DESC' },
    filter: { status: 'pending' },
  });

  const act = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await customDataProvider.updateSellerStatus(id, status);
      notify(status === 'approved' ? 'Vendeur approuvé.' : 'Vendeur rejeté.', { type: 'success' });
      refetch();
    } catch {
      notify('Échec de la mise à jour.', { type: 'error' });
    }
  };

  const applications = data ?? [];

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">{translate('app.dashboard.recentApplications')}</Typography>
          <Button size="small" startIcon={<FilterListIcon />}>
            {translate('app.dashboard.filter')}
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Nom de la boutique</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de candidature</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={seller.photoURL} sx={{ width: 28, height: 28 }}>
                      {seller.displayName?.[0]}
                    </Avatar>
                    <Typography variant="body2">{seller.displayName}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{seller.sellerProfile?.storeName ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={seller.sellerStatus ?? 'pending'} />
                </TableCell>
                <TableCell>
                  {seller.sellerProfile?.submittedAt
                    ? new Date(seller.sellerProfile.submittedAt).toLocaleDateString('fr-FR')
                    : seller.createdAt
                      ? new Date(seller.createdAt).toLocaleDateString('fr-FR')
                      : '—'}
                </TableCell>
                <TableCell>
                  <Button size="small" color="success" onClick={() => act(seller.id, 'approved')}>
                    Valider
                  </Button>
                  <Button size="small" color="error" onClick={() => act(seller.id, 'rejected')}>
                    Rejeter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Affichage de {applications.length} sur {total ?? 0} candidatures en attente
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
