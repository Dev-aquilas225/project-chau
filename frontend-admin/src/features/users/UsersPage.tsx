import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { listUsers, setUserRole } from './api';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatDate, cn } from '@/lib/utils';
import type { Role } from '@/types';

export function UsersPage() {
  const { user: current } = useAuth();
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: listUsers });
  const mut = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: Role }) => setUserRole(uid, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const toggle = async (uid: string, role: Role) => {
    const next: Role = role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Passer cet utilisateur en « ${next} » ?`)) return;
    try {
      await mut.mutateAsync({ uid, role: next });
      toast.success('Rôle mis à jour');
      if (next === 'admin') toast.info('Pensez à poser le custom claim via scripts/set-admin.mjs.');
    } catch { toast.error('Modification impossible'); }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl">Utilisateurs</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b border-line bg-gray-50">
            <tr><th className="th">Nom</th><th className="th">Email</th><th className="th">Rôle</th><th className="th">Inscrit le</th><th className="th text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? <tr><td className="td" colSpan={5}>Chargement…</td></tr> : users.map((u) => (
              <tr key={u.uid}>
                <td className="td font-medium">{u.displayName}</td>
                <td className="td text-muted">{u.email}</td>
                <td className="td">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', u.role === 'admin' ? 'bg-ink text-paper' : 'bg-gray-200 text-ink')}>
                    {u.role}
                  </span>
                </td>
                <td className="td text-muted">{formatDate(u.createdAt)}</td>
                <td className="td text-right">
                  {u.uid === current?.uid ? (
                    <span className="text-xs text-muted">vous</span>
                  ) : (
                    <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => toggle(u.uid, u.role)}>
                      {u.role === 'admin' ? <><ShieldOff className="h-3 w-3" /> Rétrograder</> : <><Shield className="h-3 w-3" /> Promouvoir admin</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
