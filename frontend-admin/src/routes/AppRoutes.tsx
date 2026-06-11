import { Routes, Route } from 'react-router-dom';
import { RequireAdmin } from '@/features/auth/RequireAdmin';
import { AdminLayout } from '@/components/AdminLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { StockPage } from '@/features/stock/StockPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { UsersPage } from '@/features/users/UsersPage';
import { PromosPage } from '@/features/promos/PromosPage';
import { PaymentsPage } from '@/features/payments/PaymentsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="produits" element={<ProductsPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="commandes" element={<OrdersPage />} />
        <Route path="utilisateurs" element={<UsersPage />} />
        <Route path="promotions" element={<PromosPage />} />
        <Route path="paiements" element={<PaymentsPage />} />
        <Route path="*" element={<p className="text-muted">Page introuvable.</p>} />
      </Route>
    </Routes>
  );
}
