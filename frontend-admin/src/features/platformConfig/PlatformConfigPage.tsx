import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, FormControlLabel, InputAdornment, Stack, Switch, TextField, Typography } from '@mui/material';
import { usePlatformConfig, useUpdatePlatformConfig } from './hooks';
import { useHasPermission } from '@/features/auth/usePermission';

export default function PlatformConfigPage() {
  const canManage = useHasPermission('platformConfig', 'manage');
  const { data, isLoading } = usePlatformConfig();
  const updateMutation = useUpdatePlatformConfig();
  const [commissionRate, setCommissionRate] = useState(0);
  const [sellerRegistrationEnabled, setSellerRegistrationEnabled] = useState(true);

  useEffect(() => {
    if (data) {
      setCommissionRate(data.commissionRate);
      setSellerRegistrationEnabled(data.sellerRegistrationEnabled);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ commissionRate, sellerRegistrationEnabled });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Paramètres plateforme
      </Typography>

      <Card sx={{ maxWidth: 480 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Taux de commission"
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              helperText="Pourcentage prélevé sur chaque vente réalisée par un vendeur"
              fullWidth
              disabled={!canManage}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={sellerRegistrationEnabled}
                  onChange={(e) => setSellerRegistrationEnabled(e.target.checked)}
                  disabled={!canManage}
                />
              }
              label="Autoriser les nouvelles candidatures vendeur"
            />
            {canManage && (
              <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending} sx={{ alignSelf: 'flex-start' }}>
                Enregistrer
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
