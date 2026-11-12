import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FaBoxOpen, FaChevronRight } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { Button, EmptyState, ErrorState, Pagination, Skeleton, StatusBadge, Select } from '../components/ui';
import { orderApi } from '../services/endpoints';
import { ORDER_STATUSES, ORDER_STATUS_META, PAYMENT_METHODS } from '../utils/constants';
import { formatDate, formatPrice } from '../utils/format';

const Orders = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['orders', 'my', { page, status }],
    queryFn: () => orderApi.mine({ page, status, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const orders = data?.items || [];

  return (
    <PageTransition title="Моите поръчки">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle eyebrow="Профил" title="Моите поръчки" description="Следете статуса на всички ваши поръчки." />
        <Select
          aria-label="Филтър по статус"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder="Всички статуси"
          options={ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label }))}
          className="w-full sm:w-56"
        />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !orders.length ? (
        <EmptyState
          icon={<FaBoxOpen size={20} />}
          title={status ? 'Няма поръчки с този статус' : 'Все още нямате поръчки'}
          text="Когато направите поръчка, ще я видите тук."
          action={<Button to="/shop">Към магазина</Button>}
        />
      ) : (
        <div className={`grid gap-3 transition ${isFetching ? 'opacity-60' : ''}`}>
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group grid min-w-0 gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 transition hover:border-emerald-400/30 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:p-5"
            >
              <div className="min-w-0">
                <p className="break-all font-semibold text-white">{order.orderNumber}</p>
                <p className="text-sm text-slate-400">
                  {formatDate(order.createdAt, true)} · {order.items.length} продукта · {PAYMENT_METHODS[order.paymentMethod]?.label}
                </p>
              </div>
              <StatusBadge value={order.status} meta={ORDER_STATUS_META} />
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-bold text-white">{formatPrice(order.totalPrice)}</span>
                <FaChevronRight className="text-slate-500 transition group-hover:text-emerald-300" />
              </div>
            </Link>
          ))}
          <Pagination page={page} pages={data.pagination.pages} onChange={setPage} disabled={isFetching} />
        </div>
      )}
    </PageTransition>
  );
};

export default Orders;
