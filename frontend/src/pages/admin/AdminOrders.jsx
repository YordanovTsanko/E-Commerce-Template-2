import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FaEye } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable } from '../../components/admin/DataTable';
import { ListToolbar } from '../../components/admin/ListToolbar';
import { OrderItemsList, OrderTotals, ShippingAddressCard } from '../../components/common/OrderItemsList';
import { Button, Modal, Select, Input, StatusBadge } from '../../components/ui';
import { orderApi } from '../../services/endpoints';
import { useAdminList } from '../../hooks/useAdminList';
import {
  ORDER_STATUSES,
  ORDER_STATUS_META,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_META,
  PAYMENT_METHODS,
} from '../../utils/constants';
import { formatDate, formatPrice, getUserName } from '../../utils/format';

const statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label }));
const paymentOptions = PAYMENT_STATUSES.map((s) => ({ value: s, label: PAYMENT_STATUS_META[s].label }));

const OrderModal = ({ order, onClose }) => {
  const [status, setStatus] = useState(order?.status);
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus);
  const [note, setNote] = useState('');

  useEffect(() => {
    setStatus(order?.status);
    setPaymentStatus(order?.paymentStatus);
    setNote('');
  }, [order]);

  const mutation = useMutation({
    mutationFn: () => orderApi.updateStatus(order._id, { status, paymentStatus, note }),
    meta: { successMessage: 'Поръчката е обновена', invalidates: [['orders'], ['admin', 'stats'], ['products']] },
    onSuccess: onClose,
  });

  if (!order) return null;
  const changed = status !== order.status || paymentStatus !== order.paymentStatus;
  const isCancelled = order.status === 'Cancelled';

  return (
    <Modal
      open={Boolean(order)}
      onClose={mutation.isPending ? undefined : onClose}
      title={`Поръчка ${order.orderNumber}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Затвори
          </Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!changed}>
            Запази промените
          </Button>
        </>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-3">
          <Select
            label="Статус на поръчката"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            disabled={isCancelled}
          />
          <Select label="Статус на плащането" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} options={paymentOptions} />
          <Input label="Бележка (по желание)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          {status === 'Cancelled' && !isCancelled && (
            <p className="text-sm text-amber-300 sm:col-span-3">При отказ наличностите на продуктите ще бъдат възстановени.</p>
          )}
          {isCancelled && <p className="text-sm text-slate-400 sm:col-span-3">Отказаните поръчки не могат да бъдат активирани отново.</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="grid content-start gap-3">
            <h3 className="font-semibold text-white">Продукти</h3>
            <OrderItemsList items={order.items} linkable={false} />
          </div>
          <div className="grid content-start gap-5">
            <div className="grid gap-2">
              <h3 className="font-semibold text-white">Клиент</h3>
              <ShippingAddressCard address={order.shippingAddress} />
            </div>
            <div className="grid gap-2">
              <h3 className="font-semibold text-white">Плащане</h3>
              <p className="text-sm text-slate-300">{PAYMENT_METHODS[order.paymentMethod]?.label}</p>
              <OrderTotals order={order} />
            </div>
          </div>
        </div>

        {order.statusHistory?.length > 0 && (
          <div className="grid gap-2">
            <h3 className="font-semibold text-white">История</h3>
            <ul className="grid gap-1 text-sm text-slate-400">
              {[...order.statusHistory].reverse().map((h, i) => (
                <li key={i}>
                  {formatDate(h.changedAt, true)} — <span className="text-slate-200">{ORDER_STATUS_META[h.status]?.label}</span>
                  {h.note && ` · ${h.note}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

const AdminOrders = () => {
  const [selected, setSelected] = useState(null);
  const list = useAdminList({
    queryKey: ['orders', 'admin'],
    filterKeys: ['status', 'paymentStatus'],
    fetcher: orderApi.all,
  });

  const columns = [
    {
      key: 'orderNumber',
      header: 'Поръчка',
      render: (o) => (
        <div>
          <p className="font-medium text-white">{o.orderNumber}</p>
          <p className="text-xs text-slate-500">{formatDate(o.createdAt, true)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Клиент',
      render: (o) => (
        <div>
          <p>{o.shippingAddress?.fullName || getUserName(o.user)}</p>
          <p className="text-xs text-slate-500">{o.shippingAddress?.phone}</p>
        </div>
      ),
    },
    { key: 'total', header: 'Сума', render: (o) => <span className="font-semibold text-white">{formatPrice(o.totalPrice)}</span> },
    { key: 'payment', header: 'Плащане', render: (o) => <StatusBadge value={o.paymentStatus} meta={PAYMENT_STATUS_META} /> },
    { key: 'status', header: 'Статус', render: (o) => <StatusBadge value={o.status} meta={ORDER_STATUS_META} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (o) => (
        <Button variant="secondary" size="sm" icon={<FaEye />} onClick={() => setSelected(o)}>
          Детайли
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Поръчки" description="Преглед и управление на статусите на поръчките." />

      <ListToolbar search={list.search} onSearch={list.setSearch} placeholder="Номер, име, имейл или телефон...">
        <Select
          aria-label="Статус"
          value={list.filters.status}
          onChange={(e) => list.setFilter('status', e.target.value)}
          placeholder="Всички статуси"
          options={statusOptions}
          className="sm:w-48"
        />
        <Select
          aria-label="Плащане"
          value={list.filters.paymentStatus}
          onChange={(e) => list.setFilter('paymentStatus', e.target.value)}
          placeholder="Всички плащания"
          options={paymentOptions}
          className="sm:w-48"
        />
      </ListToolbar>

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.isLoading}
        fetching={list.isFetching}
        error={list.error}
        onRetry={list.refetch}
        pagination={list.pagination}
        onPageChange={list.setPage}
        emptyText="Няма поръчки."
      />

      <OrderModal order={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default AdminOrders;
