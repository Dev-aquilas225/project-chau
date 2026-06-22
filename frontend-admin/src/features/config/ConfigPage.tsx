import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getPlatformConfig, updatePlatformConfig } from './api';

export function ConfigPage() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ['platform-config'], queryFn: getPlatformConfig });

  const [commission, setCommission] = useState('');
  const [sellerEnabled, setSellerEnabled] = useState(true);

  useEffect(() => {
    if (config) {
      setCommission(String(config.commissionRate));
      setSellerEnabled(config.sellerRegistrationEnabled);
    }
  }, [config]);

  const mut = useMutation({
    mutationFn: updatePlatformConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-config'] });
      toast.success('Configuration sauvegardée');
    },
    onError: () => toast.error('Échec de la sauvegarde'),
  });

  const save = () => {
    const rate = parseFloat(commission);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Taux de commission invalide (0-100)');
      return;
    }
    mut.mutate({ commissionRate: rate, sellerRegistrationEnabled: sellerEnabled });
  };

  if (isLoading) return <p className="text-muted">Chargement…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl">Configuration de la plateforme</h1>
      </div>

      <div className="card max-w-lg space-y-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Paramètres marketplace</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Taux de commission plateforme (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="input w-32"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                />
                <span className="text-sm text-muted">% prélevé sur chaque vente</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Exemple : avec 10%, une vente à 100 € génère 10 € de commission et 90 € reversés au vendeur.
              </p>
            </div>

            <div>
              <label className="label">Inscriptions vendeurs</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={sellerEnabled}
                  onClick={() => setSellerEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sellerEnabled ? 'bg-ink' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sellerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm">{sellerEnabled ? 'Activées' : 'Désactivées'}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Si désactivé, les nouveaux utilisateurs ne peuvent pas soumettre de candidature vendeur.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-4">
          <button
            className="btn flex items-center gap-2"
            onClick={save}
            disabled={mut.isPending}
          >
            <Save className="h-4 w-4" />
            {mut.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
