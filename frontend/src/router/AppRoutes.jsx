import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, GuestRoute } from '../components/routing/RouteGuards';
import { AdminLayout } from '../components/admin/AdminLayout';

// Lazy loading – всяка страница се зарежда отделно (по-бърз първоначален старт)
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('../pages/admin/AdminProductForm'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminBanners = lazy(() => import('../pages/admin/AdminBanners'));

export const AppRoutes = ({ location }) => (
  <Routes location={location}>
    {/* Публични */}
    <Route path="/" element={<Home />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/product/:idOrSlug" element={<ProductDetails />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/verify-email/:token" element={<VerifyEmail />} />

    {/* Само за гости */}
    <Route element={<GuestRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Route>

    {/* Само за влезли потребители */}
    <Route element={<ProtectedRoute />}>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/profile" element={<Profile />} />
    </Route>

    {/* Админ панел (admin / superAdmin) */}
    <Route path="/admin" element={<AdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>

    {/* 404 за всички невалидни адреси */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
