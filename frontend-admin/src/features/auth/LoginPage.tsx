import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminLogin, useAuth } from './AuthProvider';

export function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin(email, password);
      await refresh();
      navigate('/');
    } catch {
      toast.error('Identifiants incorrects ou accès non autorisé.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg bg-paper p-8 shadow-xl">
        <h1 className="brand-logo mb-1 text-center text-2xl">Occasion de luxe PJ international</h1>
        <p className="mb-6 text-center text-sm text-muted">Back-office administrateur</p>
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email" />
        <label className="label">Mot de passe</label>
        <input className="input mb-6" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password" />
        <button className="btn-primary w-full" disabled={busy} data-testid="admin-login">
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <p className="mt-4 text-center text-xs text-muted">Démo : admin@aquilas.com / admin1234</p>
      </form>
    </div>
  );
}
