import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaBoxOpen, FaEuroSign, FaReceipt, FaUsers, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Panel, Card, Skeleton, ErrorState, StatusBadge, Button } from '../../components/ui';
import { adminApi } from '../../services/endpoints';
import { ORDER_STATUSES, ORDER_STATUS_META } from '../../utils/constants';
import { formatDate, formatPrice, formatQuantity, getUserName } from '../../utils/format';
import { optimizeImage } from '../../utils/image';

const StatCard = ({ icon, label, value, hint }) => (
  <Card className="p-5">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{icon}</div>
    <p className="mt-4 text-sm text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </Card>
);

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.stats });

  return (
    <>
      <AdminPageHeader
        title="Табло"
        description="Кратък преглед на магазина."
        actions={
          <Button to="/admin/products/new" icon={<FaPlus />}>
            Нов продукт
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<FaEuroSign />}
              label="Приходи (общо)"
              value={formatPrice(data.revenue.total)}
              hint={`${formatPrice(data.revenue.last30Days)} за последните 30 дни`}
            />
            <StatCard icon={<FaReceipt />} label="Поръчки" value={data.counts.orders} hint={`${data.revenue.ordersLast30Days} за 30 дни`} />
            <StatCard
              icon={<FaBoxOpen />}
              label="Продукти"
              value={data.counts.products}
              hint={`${data.counts.activeProducts} активни · ${data.counts.categories} категории`}
            />
            <StatCard icon={<FaUsers />} label="Потребители" value={data.counts.users} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {ORDER_STATUSES.map((status) => (
              <Link
                key={status}
                to={`/admin/orders?status=${status}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center transition hover:border-emerald-400/30"
              >
                <p className="text-2xl font-bold text-white">{data.ordersByStatus[status] || 0}</p>
                <StatusBadge value={status} meta={ORDER_STATUS_META} />
              </Link>
            ))}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Panel className="grid min-w-0 content-start gap-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Последни поръчки</h2>
                <Link to="/admin/orders" className="text-sm text-emerald-300 hover:text-emerald-200">
                  Всички
                </Link>
              </div>
              {data.recentOrders.length === 0 ? (
                <p className="text-slate-400">Все още няма поръчки.</p>
              ) : (
                <ul className="grid gap-2">
                  {data.recentOrders.map((order) => (
                    <li key={order._id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950/40 px-3 py-3 sm:px-4">
                      <div className="min-w-0">
                        <p className="break-all font-medium text-white">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">
                          {getUserName(order.user)} · {formatDate(order.createdAt, true)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge value={order.status} meta={ORDER_STATUS_META} />
                        <span className="font-semibold text-white">{formatPrice(order.totalPrice)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel className="grid min-w-0 content-start gap-4 p-4 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <FaExclamationTriangle className="text-amber-300" /> Ниска наличност (≤ {data.lowStockThreshold})
              </h2>
              {data.lowStock.length === 0 ? (
                <p className="text-slate-400">Всички продукти са с достатъчна наличност.</p>
              ) : (
                <ul className="grid gap-2">
                  {data.lowStock.map((p) => (
                    <li key={p._id}>
                      <Link
                        to={`/admin/products/${p._id}/edit`}
                        className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-950/40 px-3 py-2 transition hover:bg-white/5"
                      >
                        {p.images?.[0]?.url && (
                          <img src={optimizeImage(p.images[0].url, 80)} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{p.name}</span>
                        <span className={`shrink-0 text-sm font-semibold ${p.stock === 0 ? 'text-rose-300' : 'text-amber-300'}`}>
                          {formatQuantity(p.stock, p.unit)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
