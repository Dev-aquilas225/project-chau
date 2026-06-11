import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
