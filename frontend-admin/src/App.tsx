import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import RequireStaff from '@/components/layout/RequireStaff';
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
const RoleListPage = lazy(() => import('@/features/roles/RoleListPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireStaff />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="produits"
            element={
              <Suspense fallback={<PageFallback />}>
                <ProductListPage />
              </Suspense>
            }
          />
          <Route
            path="produits/nouveau"
            element={
              <Suspense fallback={<PageFallback />}>
                <ProductFormPage />
              </Suspense>
            }
          />
          <Route
            path="produits/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <ProductFormPage />
              </Suspense>
            }
          />
          <Route
            path="categories"
            element={
              <Suspense fallback={<PageFallback />}>
                <CategoryListPage />
              </Suspense>
            }
          />
          <Route
            path="commandes"
            element={
              <Suspense fallback={<PageFallback />}>
                <OrderListPage />
              </Suspense>
            }
          />
          <Route
            path="commandes/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <OrderDetailPage />
              </Suspense>
            }
          />
          <Route
            path="utilisateurs"
            element={
              <Suspense fallback={<PageFallback />}>
                <UserListPage />
              </Suspense>
            }
          />
          <Route
            path="codes-promo"
            element={
              <Suspense fallback={<PageFallback />}>
                <PromoCodeListPage />
              </Suspense>
            }
          />
          <Route
            path="vendeurs"
            element={
              <Suspense fallback={<PageFallback />}>
                <SellerListPage />
              </Suspense>
            }
          />
          <Route
            path="vendeurs/:userId"
            element={
              <Suspense fallback={<PageFallback />}>
                <SellerDetailPage />
              </Suspense>
            }
          />
          <Route
            path="parametres"
            element={
              <Suspense fallback={<PageFallback />}>
                <PlatformConfigPage />
              </Suspense>
            }
          />
          <Route
            path="roles"
            element={
              <Suspense fallback={<PageFallback />}>
                <RoleListPage />
              </Suspense>
            }
          />
          <Route
            path="profil"
            element={
              <Suspense fallback={<PageFallback />}>
                <ProfilePage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
