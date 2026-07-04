import { Admin, CustomRoutes, Resource } from 'react-admin';
import { Route } from 'react-router-dom';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import { i18nProvider } from './i18n/fr';
import { Layout } from './layout/Layout';
import { LoginPage } from './layout/LoginPage';
import { theme } from './theme/theme';

import { DashboardPage } from './resources/dashboard/DashboardPage';
import { ConfigPage } from './resources/config/ConfigPage';
import { OrderList } from './resources/orders/OrderList';
import { OrderShow } from './resources/orders/OrderShow';
import { PaymentsDashboardPage } from './resources/payments/PaymentsDashboardPage';
import { ProductCreate } from './resources/products/ProductCreate';
import { ProductEdit } from './resources/products/ProductEdit';
import { ProductList } from './resources/products/ProductList';
import { PromotionCreate } from './resources/promotions/PromotionCreate';
import { PromotionEdit } from './resources/promotions/PromotionEdit';
import { PromotionList } from './resources/promotions/PromotionList';
import { SellerList } from './resources/sellers/SellerList';
import { SellerShow } from './resources/sellers/SellerShow';
import { StockList } from './resources/stock/StockList';
import { UserEdit } from './resources/users/UserEdit';
import { UserList } from './resources/users/UserList';

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      theme={theme}
      layout={Layout}
      loginPage={LoginPage}
      dashboard={DashboardPage}
      requireAuth
    >
      <Resource name="sellers" list={SellerList} show={SellerShow} />
      <Resource name="products" list={ProductList} edit={ProductEdit} create={ProductCreate} />
      <Resource name="orders" list={OrderList} show={OrderShow} />
      <Resource name="users" list={UserList} edit={UserEdit} />
      <Resource name="promotions" list={PromotionList} edit={PromotionEdit} create={PromotionCreate} />
      <CustomRoutes>
        <Route path="/stock" element={<StockList />} />
        <Route path="/payments" element={<PaymentsDashboardPage />} />
        <Route path="/config" element={<ConfigPage />} />
      </CustomRoutes>
    </Admin>
  );
}
