import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { SellerProtectedRoute } from '@/features/seller/SellerProtectedRoute';
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
import { BecomeSellerPage } from '@/features/seller/BecomeSellerPage';
import { SellerDashboardPage } from '@/features/seller/SellerDashboardPage';
import { MyListingsPage } from '@/features/seller/MyListingsPage';
import { CreateListingPage } from '@/features/seller/CreateListingPage';
import { EditListingPage } from '@/features/seller/EditListingPage';
import { SellerOrdersPage } from '@/features/seller/SellerOrdersPage';
import { WalletPage } from '@/features/wallet/WalletPage';
import { OffersPage } from '@/features/offers/OffersPage';

export function AppRoutes() {
  const { t } = useTranslation('common');
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
        <Route path="portefeuille" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="offres" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />

        {/* Seller routes */}
        <Route path="devenir-vendeur" element={<ProtectedRoute><BecomeSellerPage /></ProtectedRoute>} />
        <Route path="espace-vendeur" element={<SellerProtectedRoute><SellerDashboardPage /></SellerProtectedRoute>} />
        <Route path="espace-vendeur/annonces" element={<SellerProtectedRoute><MyListingsPage /></SellerProtectedRoute>} />
        <Route path="espace-vendeur/annonces/creer" element={<SellerProtectedRoute><CreateListingPage /></SellerProtectedRoute>} />
        <Route path="espace-vendeur/annonces/:id/modifier" element={<SellerProtectedRoute><EditListingPage /></SellerProtectedRoute>} />
        <Route path="espace-vendeur/commandes" element={<SellerProtectedRoute><SellerOrdersPage /></SellerProtectedRoute>} />

        <Route path="*" element={<div className="container-app py-20 text-center text-muted">{t('notFound')}</div>} />
      </Route>
    </Routes>
  );
}
