import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function SellerProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user, sellerStatus } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login?redirect=/espace-vendeur" replace />;
  if (sellerStatus !== 'approved') return <Navigate to="/devenir-vendeur" replace />;
  return <>{children}</>;
}
