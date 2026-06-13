import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, MapPin, User as UserIcon } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useAuth } from '@/features/auth/AuthProvider';
import { logout } from '@/features/auth/api';
import type { Address, UserProfile } from '@/types';

export function ProfilePage() {
  const { user, profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [addr, setAddr] = useState<Address>({ fullName: '', line1: '', city: '', zip: '', country: 'France' });
  const [saving, setSaving] = useState(false);

  if (!user || !profile) return null;

  const saveName = async () => {
    setSaving(true);
    try {
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { displayName: name } });
      await refresh();
      toast.success('Profil mis à jour');
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const addAddress = async () => {
    if (!addr.line1 || !addr.city) { toast.error('Adresse incomplète'); return; }
    try {
      const addresses = [...(profile.addresses ?? []), addr];
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { addresses } });
      await refresh();
      setAddr({ fullName: '', line1: '', city: '', zip: '', country: 'France' });
      toast.success('Adresse ajoutée');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="container-app max-w-2xl py-6">
      <h1 className="mb-6 text-2xl">Mon compte</h1>

      <section className="mb-8 rounded-lg border border-line p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg"><UserIcon className="h-5 w-5" /> Profil</h2>
        <p className="mb-3 text-sm text-muted">{profile.email}</p>
        <label className="text-sm">Nom affiché</label>
        <div className="mt-1 flex gap-2">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary px-5" onClick={saveName} disabled={saving}>Enregistrer</button>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-line p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg"><MapPin className="h-5 w-5" /> Adresses</h2>
        {profile.addresses?.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {profile.addresses.map((a, i) => (
              <li key={i} className="rounded border border-line p-3 text-sm">
                <p className="font-medium">{a.fullName}</p>
                <p className="text-muted">{a.line1}, {a.zip} {a.city}, {a.country}</p>
              </li>
            ))}
          </ul>
        ) : <p className="mb-4 text-sm text-muted">Aucune adresse enregistrée.</p>}

        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input sm:col-span-2" placeholder="Nom complet" value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Adresse" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
          <input className="input" placeholder="Ville" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          <input className="input" placeholder="Code postal" value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} />
        </div>
        <button className="btn-outline mt-3" onClick={addAddress}>Ajouter l'adresse</button>
      </section>

      <button className="btn-outline w-full" onClick={() => logout().then(() => navigate('/'))}>
        <LogOut className="h-4 w-4" /> Se déconnecter
      </button>
    </div>
  );
}
