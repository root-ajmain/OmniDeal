import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/layout/Layout.jsx';
import PageLoader from '../components/ui/PageLoader.jsx';
import useAuthStore from '../store/authStore.js';

const Home = lazy(() => import('../pages/Home.jsx'));
const Products = lazy(() => import('../pages/Products.jsx'));
const ProductDetail = lazy(() => import('../pages/ProductDetail.jsx'));
const Category = lazy(() => import('../pages/Category.jsx'));
const Search = lazy(() => import('../pages/Search.jsx'));
const Cart = lazy(() => import('../pages/Cart.jsx'));
const Checkout = lazy(() => import('../pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess.jsx'));
const OrderTracking = lazy(() => import('../pages/OrderTracking.jsx'));
const Wishlist = lazy(() => import('../pages/Wishlist.jsx'));
const FlashSale = lazy(() => import('../pages/FlashSale.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx'));
const GoogleSuccess = lazy(() => import('../pages/GoogleSuccess.jsx'));
const Account = lazy(() => import('../pages/Account.jsx'));
const ReturnRequest = lazy(() => import('../pages/ReturnRequest.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

function GuestRoute({ children }) {
  const user = useAuthStore(s => s.user);
  return user ? <Navigate to="/account" replace /> : children;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order/:orderNumber?" element={<OrderTracking />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/flash-sale" element={<FlashSale />} />
          <Route path="/account" element={<Account />} />
          <Route path="/return-request" element={<ReturnRequest />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
