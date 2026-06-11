import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { listPromos, upsertPromo, deletePromo, type PromoInput } from './api';
import { cn } from '@/lib/utils';

export function PromosPage() {
  const qc = useQueryClient();
  const { data: promos = [], isLoading } = useQuery({ queryKey: ['admin-promos'], queryFn: listPromos });
  const save = useMutation({ mutationFn: (i: PromoInput) => upsertPromo(i), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promos'] }) });
  const del = useMutation({ mutationFn: (id: string) => deletePromo(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promos'] }) });

  const [form, setForm] = useState<PromoInput>({ code: '', type: 'percentage', value: 10, active: true, minAmount: 0 });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Code requis'); return; }
    try { await save.mutateAsync(form); toast.success('Code promo enregistré'); setForm({ code: '', type: 'percentage', value: 10, active: true, minAmount: 0 }); }
    catch { toast.error('Enregistrement impossible'); }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl">Promotions & codes promo</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="card h-fit space-y-3">
          <h2 className="flex items-center gap-2 text-lg"><Plus className="h-4 w-4" /> Nouveau code</h2>
          <div><label className="label">Code</label><input className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SOLDES20" /></div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PromoInput['type'] })}>
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe ($)</option>
            </select>
          </div>
          <div><label className="label">Valeur</label><input className="input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
          <div><label className="label">Montant minimum ($)</label><input className="input" type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Actif</label>
          <button className="btn-primary w-full" disabled={save.isPending}>Créer le code</button>
        </form>

        <div className="lg:col-span-2">
          <div className="card overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b border-line bg-gray-50">
                <tr><th className="th">Code</th><th className="th">Réduction</th><th className="th">Min.</th><th className="th">Statut</th><th className="th text-right"></th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? <tr><td className="td" colSpan={5}>Chargement…</td></tr>
                : promos.length === 0 ? <tr><td className="td text-muted" colSpan={5}>Aucun code promo.</td></tr>
                : promos.map((p) => (
                  <tr key={p.id}>
                    <td className="td"><span className="flex items-center gap-1 font-mono font-semibold"><Tag className="h-3 w-3" />{p.code}</span></td>
                    <td className="td">{p.type === 'percentage' ? `${p.value}%` : `${p.value} $`}</td>
                    <td className="td text-muted">{p.minAmount ? `${p.minAmount} $` : '—'}</td>
                    <td className="td"><span className={cn('rounded-full px-2 py-0.5 text-xs', p.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-muted')}>{p.active ? 'Actif' : 'Inactif'}</span></td>
                    <td className="td text-right">
                      <button className="rounded p-1.5 text-sale hover:bg-red-50" aria-label="Supprimer"
                        onClick={() => { if (confirm(`Supprimer le code ${p.code} ?`)) del.mutate(p.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
