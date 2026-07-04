import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Title, useNotify } from 'react-admin';
import { PageContainer } from '../../components/PageContainer';
import { customDataProvider, type PlatformConfig } from '../../dataProvider';

export function ConfigPage() {
  const notify = useNotify();
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customDataProvider.getConfig().then(setConfig);
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await customDataProvider.updateConfig(config);
      setConfig(updated);
      notify('Configuration enregistrée.', { type: 'success' });
    } catch {
      notify("Échec de l'enregistrement.", { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title="Configuration de la plateforme" subtitle="Paramètres généraux de la marketplace.">
      <Title title="Configuration" />
      {!config ? (
        <Typography variant="body2">Chargement…</Typography>
      ) : (
        <Card sx={{ maxWidth: 480 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Taux de commission (%)"
                type="number"
                value={config.commissionRate}
                onChange={(e) => setConfig({ ...config, commissionRate: Number(e.target.value) })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.sellerRegistrationEnabled}
                    onChange={(e) => setConfig({ ...config, sellerRegistrationEnabled: e.target.checked })}
                  />
                }
                label="Inscription des vendeurs activée"
              />
              <Box>
                <Button variant="contained" disabled={saving} onClick={save}>
                  Enregistrer
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
