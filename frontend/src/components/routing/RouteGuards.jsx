import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FullPageLoader } from '../ui';

// Само за влезли потребители
export const ProtectedRoute = () => {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <FullPageLoader label="Проверка на профила..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

// Само за admin / superAdmin
export const AdminRoute = () => {
  const { user, ready, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) return <FullPageLoader label="Проверка на правата..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};

// Вход/регистрация – само за гости
export const GuestRoute = () => {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <FullPageLoader />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  return <Outlet />;
};
