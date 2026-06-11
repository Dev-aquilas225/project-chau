import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '@/features/catalog/HomePage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage';
import { FavoritesPage } from '@/features/favorites/FavoritesPage';
import { CartPage } from '@/features/cart/CartPage';
import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { ProfilePage } from '@/features/account/ProfilePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue" element={<CatalogPage />} />
        <Route path="produit/:id" element={<ProductDetailPage />} />
        <Route path="favoris" element={<FavoritesPage />} />
        <Route path="panier" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="compte" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<div className="container-app py-20 text-center text-muted">Page introuvable.</div>} />
      </Route>
    </Routes>
  );
}
