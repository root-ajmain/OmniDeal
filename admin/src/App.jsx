import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminLayout from './components/layout/AdminLayout.jsx';
import useAdminAuthStore from './store/adminAuthStore.js';

const Login = lazy(() => import('./pages/Login.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductForm = lazy(() => import('./pages/ProductForm.jsx'));
const Categories = lazy(() => import('./pages/Categories.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const OrderDetail = lazy(() => import('./pages/OrderDetail.jsx'));
const Customers = lazy(() => import('./pages/Customers.jsx'));
const Reviews = lazy(() => import('./pages/Reviews.jsx'));
const Coupons = lazy(() => import('./pages/Coupons.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Banners = lazy(() => import('./pages/Banners.jsx'));
const FlashSales = lazy(() => import('./pages/FlashSales.jsx'));
const Returns = lazy(() => import('./pages/Returns.jsx'));
const SiteSettings = lazy(() => import('./pages/SiteSettings.jsx'));

const ProtectedRoute = ({ children }) => {
  const isAuth = useAdminAuthStore(s => !!s.token);
  return isAuth ? children : <Navigate to="/login" replace />;
};

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="banners" element={<Banners />} />
            <Route path="flash-sales" element={<FlashSales />} />
            <Route path="returns" element={<Returns />} />
            <Route path="settings" element={<SiteSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
