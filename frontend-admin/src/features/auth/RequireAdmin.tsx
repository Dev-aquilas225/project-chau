import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth, adminLogout } from './AuthProvider';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // ⚠️ Ce garde est de l'UX. La vraie protection vit dans les guards NestJS (RolesGuard('admin')).
  if (role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-sale" />
        <h1 className="text-xl">Accès réservé aux administrateurs</h1>
        <p className="text-muted">Votre compte n'a pas le rôle admin.</p>
        <button className="btn-outline" onClick={() => adminLogout().then(() => window.location.assign('/login'))}>Se déconnecter</button>
      </div>
    );
  }

  return <>{children}</>;
}
