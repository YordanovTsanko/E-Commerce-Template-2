import { Suspense, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { FullPageLoader } from './components/ui';
import { AppRoutes } from './router/AppRoutes';
import { bootstrapAuth } from './store/authSlice';
import { fetchCart } from './store/cartSlice';
import { fetchWishlistIds } from './store/wishlistSlice';
import { useStoreConfig } from './hooks/useStoreConfig';

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  useStoreConfig(); // зарежда валута, доставка и ДДС от backend

  useEffect(() => {
    dispatch(bootstrapAuth()).then(({ payload: user }) => {
      dispatch(fetchCart());
      if (user) dispatch(fetchWishlistIds());
    });
  }, [dispatch]);

  // Админ страниците споделят един layout – анимираме само при смяна на секцията
  const animationKey = location.pathname.startsWith('/admin') ? '/admin' : location.pathname;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_#04111a_0%,_#071724_55%,_#020617_100%)] text-slate-100">
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<FullPageLoader />}>
            <AnimatePresence mode="wait">
              <AppRoutes location={location} key={animationKey} />
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#020617' } },
          error: { iconTheme: { primary: '#fb7185', secondary: '#020617' } },
        }}
      />
    </div>
  );
};

export default App;
