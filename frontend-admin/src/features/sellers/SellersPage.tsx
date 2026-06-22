import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { listSellers, updateSellerStatus } from './api';
import { formatDate, cn } from '@/lib/utils';
import type { SellerStatus, UserProfile } from '@/types';

const STATUS_LABEL: Record<SellerStatus, string> = {
  none: 'Aucune',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

const STATUS_COLOR: Record<SellerStatus, string> = {
  none: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

type FilterTab = 'pending' | 'approved' | 'rejected';

export function SellersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [noteModal, setNoteModal] = useState<{ user: UserProfile; action: 'approved' | 'rejected' } | null>(null);
  const [note, setNote] = useState('');

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['admin-sellers', filter],
    queryFn: () => listSellers(filter),
  });

  const mut = useMutation({
    mutationFn: ({ userId, status, note }: { userId: string; status: 'approved' | 'rejected'; note?: string }) =>
      updateSellerStatus(userId, status, note),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-sellers'] });
      toast.success(vars.status === 'approved' ? 'Vendeur approuvé' : 'Candidature rejetée');
      setNoteModal(null);
      setNote('');
    },
    onError: () => toast.error('Action impossible'),
  });

  const handleAction = (user: UserProfile, action: 'approved' | 'rejected') => {
    setNoteModal({ user, action });
    setNote('');
  };

  const confirm = () => {
    if (!noteModal) return;
    mut.mutate({ userId: noteModal.user.id, status: noteModal.action, note: note || undefined });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl">Vendeurs</h1>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {(['pending', 'approved', 'rejected'] as FilterTab[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium',
              filter === f ? 'bg-ink text-paper' : 'bg-gray-100 text-ink hover:bg-gray-200',
            )}
          >
            {STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b border-line bg-gray-50">
            <tr>
              <th className="th">Nom / Boutique</th>
              <th className="th">Email</th>
              <th className="th">Statut</th>
              <th className="th">Inscrit le</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <tr><td className="td" colSpan={5}>Chargement…</td></tr>
            ) : sellers.length === 0 ? (
              <tr><td className="td text-muted" colSpan={5}>Aucun vendeur dans cette catégorie.</td></tr>
            ) : sellers.map((u) => (
              <tr key={u.id}>
                <td className="td">
                  <p className="font-medium">{u.displayName}</p>
                  {u.sellerProfile?.storeName && (
                    <p className="text-xs text-muted">{u.sellerProfile.storeName}</p>
                  )}
                </td>
                <td className="td text-muted">{u.email}</td>
                <td className="td">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLOR[u.sellerStatus ?? 'none'])}>
                    {STATUS_LABEL[u.sellerStatus ?? 'none']}
                  </span>
                </td>
                <td className="td text-muted">{formatDate(u.createdAt)}</td>
                <td className="td text-right">
                  <div className="flex justify-end gap-2">
                    {u.sellerStatus !== 'approved' && (
                      <button
                        className="btn-outline flex items-center gap-1 px-3 py-1.5 text-xs text-green-700 border-green-300"
                        onClick={() => handleAction(u, 'approved')}
                      >
                        <CheckCircle className="h-3 w-3" /> Approuver
                      </button>
                    )}
                    {u.sellerStatus !== 'rejected' && (
                      <button
                        className="btn-outline flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 border-red-300"
                        onClick={() => handleAction(u, 'rejected')}
                      >
                        <XCircle className="h-3 w-3" /> Rejeter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md space-y-4 p-6">
            <h2 className="text-lg font-semibold">
              {noteModal.action === 'approved' ? 'Approuver' : 'Rejeter'} — {noteModal.user.displayName}
            </h2>
            <div>
              <label className="label">Note (optionnelle)</label>
              <textarea
                className="input w-full"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Message envoyé au vendeur…"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-outline" onClick={() => setNoteModal(null)}>Annuler</button>
              <button
                className={cn('btn', noteModal.action === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white')}
                onClick={confirm}
                disabled={mut.isPending}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
