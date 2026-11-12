import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaTrash } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { CartItemRow } from '../components/cart/CartItemRow';
import { CartSummary } from '../components/cart/CartSummary';
import { Button, EmptyState, Panel, Skeleton, ConfirmDialog } from '../components/ui';
import { clearCart, selectCartClearing, selectCartItems, selectCartLoading } from '../store/cartSlice';
import { useCartTotals } from '../hooks/useStoreConfig';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const clearing = useSelector(selectCartClearing);
  const totals = useCartTotals();
  const [confirmClear, setConfirmClear] = useState(false);

  const hasStockIssue = items.some((i) => i.quantity > i.product.stock);

  const goToCheckout = () =>
    user ? navigate('/checkout') : navigate('/login', { state: { from: { pathname: '/checkout' } } });

  return (
    <PageTransition title="Количка">
      <SectionTitle eyebrow="Количка" title="Вашата количка" />

      {loading && !items.length ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : !items.length ? (
        <EmptyState
          icon={<FaShoppingBag size={20} />}
          title="Количката е празна"
          text="Разгледайте магазина и добавете продукти, които харесвате."
          action={<Button to="/shop">Към магазина</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Panel className="grid content-start gap-3 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{items.length} продукта</p>
              <Button variant="ghost" size="sm" icon={<FaTrash size={12} />} onClick={() => setConfirmClear(true)}>
                Изпразни
              </Button>
            </div>
            {items.map((item) => (
              <CartItemRow key={item.product._id} item={item} />
            ))}
          </Panel>

          <CartSummary totals={totals}>
            {hasStockIssue && (
              <p className="text-sm text-amber-300">Някои продукти надвишават наличността. Коригирайте количествата.</p>
            )}
            <Button onClick={goToCheckout} disabled={hasStockIssue} className="w-full">
              {user ? 'Към плащане' : 'Влезте, за да поръчате'}
            </Button>
            <Button to="/shop" variant="secondary" className="w-full">
              Продължи пазаруването
            </Button>
          </CartSummary>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        loading={clearing}
        title="Изпразване на количката"
        message="Всички продукти ще бъдат премахнати от количката."
        confirmText="Изпразни"
        onConfirm={async () => {
          await dispatch(clearCart());
          setConfirmClear(false);
        }}
      />
    </PageTransition>
  );
};

export default Cart;
