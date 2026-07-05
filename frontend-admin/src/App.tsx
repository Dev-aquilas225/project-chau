import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import RequireAdmin from '@/components/layout/RequireAdmin';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginPage from '@/features/auth/LoginPage';

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const ProductListPage = lazy(() => import('@/features/products/ProductListPage'));
const ProductFormPage = lazy(() => import('@/features/products/ProductFormPage'));
const CategoryListPage = lazy(() => import('@/features/categories/CategoryListPage'));
const OrderListPage = lazy(() => import('@/features/orders/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/OrderDetailPage'));
const UserListPage = lazy(() => import('@/features/users/UserListPage'));
const PromoCodeListPage = lazy(() => import('@/features/promoCodes/PromoCodeListPage'));
const SellerListPage = lazy(() => import('@/features/sellers/SellerListPage'));
const SellerDetailPage = lazy(() => import('@/features/sellers/SellerDetailPage'));
const PlatformConfigPage = lazy(() => import('@/features/platformConfig/PlatformConfigPage'));

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="produits" element={<ProductListPage />} />
            <Route path="produits/nouveau" element={<ProductFormPage />} />
            <Route path="produits/:id" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="commandes" element={<OrderListPage />} />
            <Route path="commandes/:id" element={<OrderDetailPage />} />
            <Route path="utilisateurs" element={<UserListPage />} />
            <Route path="codes-promo" element={<PromoCodeListPage />} />
            <Route path="vendeurs" element={<SellerListPage />} />
            <Route path="vendeurs/:userId" element={<SellerDetailPage />} />
            <Route path="parametres" element={<PlatformConfigPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
