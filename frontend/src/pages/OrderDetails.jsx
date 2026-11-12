import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { OrderTimeline } from '../components/common/OrderTimeline';
import { OrderItemsList, OrderTotals, ShippingAddressCard } from '../components/common/OrderItemsList';
import { Panel, Button, Skeleton, ErrorState, StatusBadge, ConfirmDialog, Eyebrow } from '../components/ui';
import { orderApi } from '../services/endpoints';
import { ORDER_STATUS_META, PAYMENT_METHODS, PAYMENT_STATUS_META } from '../utils/constants';
import { formatDate } from '../utils/format';
import NotFound from './NotFound';

const OrderDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => orderApi.get(id),
    retry: (count, err) => ![400, 404].includes(err.response?.status) && count < 1,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(id),
    meta: { successMessage: 'Поръчката е отказана', invalidates: [['orders'], ['products']] },
    onSuccess: (updated) => {
      queryClient.setQueryData(['orders', 'detail', id], updated);
      setConfirmCancel(false);
    },
  });

  if ([400, 404].includes(error?.response?.status)) return <NotFound title="Поръчката не е намерена" />;

  return (
    <PageTransition title={order ? `Поръчка ${order.orderNumber}` : 'Поръчка'}>
      <Button to="/orders" variant="ghost" size="sm" icon={<FaArrowLeft />} className="w-fit">
        Всички поръчки
      </Button>

      {state?.justPlaced && (
        <Panel className="flex min-w-0 items-center gap-4 border-emerald-400/30 bg-emerald-400/10 p-4 sm:p-6">
          <FaCheckCircle className="shrink-0 text-emerald-300" size={28} />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Благодарим ви за поръчката!</h2>
            <p className="text-slate-300">Ще получите потвърждение по имейл. Можете да следите статуса тук.</p>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <Panel className="grid min-w-0 gap-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Eyebrow>Поръчка</Eyebrow>
                <h1 className="mt-2 break-all text-xl font-bold text-white sm:text-3xl">{order.orderNumber}</h1>
                <p className="mt-1 text-sm text-slate-400">Направена на {formatDate(order.createdAt, true)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={order.status} meta={ORDER_STATUS_META} />
                <StatusBadge value={order.paymentStatus} meta={PAYMENT_STATUS_META} />
              </div>
            </div>
            <OrderTimeline order={order} />
          </Panel>

          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Panel className="grid min-w-0 content-start gap-4 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-white">Продукти</h2>
              <OrderItemsList items={order.items} />
            </Panel>

            <div className="grid min-w-0 content-start gap-6">
              <Panel className="grid min-w-0 gap-4 p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-white">Обобщение</h2>
                <OrderTotals order={order} />
                <p className="text-sm text-slate-400">Плащане: {PAYMENT_METHODS[order.paymentMethod]?.label}</p>
                {order.status === 'Pending' && (
                  <Button variant="danger" onClick={() => setConfirmCancel(true)}>
                    Откажи поръчката
                  </Button>
                )}
              </Panel>
              <Panel className="grid min-w-0 gap-3 p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-white">Доставка</h2>
                <ShippingAddressCard address={order.shippingAddress} />
              </Panel>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancelMutation.mutate()}
        loading={cancelMutation.isPending}
        title="Отказ на поръчката"
        message="Сигурни ли сте, че искате да откажете тази поръчка? Действието не може да бъде отменено."
        confirmText="Откажи поръчката"
      />
    </PageTransition>
  );
};

export default OrderDetails;
