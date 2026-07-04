import { useState } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useNotify, useRefresh, useTranslate } from 'react-admin';
import { customDataProvider } from '../../dataProvider';
import type { UserProfile } from '../../types';

export function SellerApproveRejectButtons({ record }: { record: UserProfile }) {
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [loading, setLoading] = useState(false);

  const act = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await customDataProvider.updateSellerStatus(record.id, status);
      notify(status === 'approved' ? 'Vendeur approuvé.' : 'Vendeur rejeté.', { type: 'success' });
      refresh();
    } catch {
      notify("Échec de la mise à jour du statut.", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (record.sellerStatus !== 'pending') return null;

  return (
    <>
      <Button
        size="small"
        color="success"
        startIcon={<CheckIcon />}
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation();
          act('approved');
        }}
      >
        {translate('app.sellers.approve')}
      </Button>
      <Button
        size="small"
        color="error"
        startIcon={<CloseIcon />}
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation();
          act('rejected');
        }}
      >
        {translate('app.sellers.reject')}
      </Button>
    </>
  );
}
