import { FaCheck, FaTimes } from 'react-icons/fa';
import { ORDER_STATUS_META } from '../../utils/constants';
import { formatDate, cn } from '../../utils/format';

const FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered'];

// Визуален прогрес на поръчката
export const OrderTimeline = ({ order }) => {
  if (order.status === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">
        <FaTimes /> Поръчката е отказана {order.cancelledAt && `на ${formatDate(order.cancelledAt, true)}`}
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(order.status);
  const historyDate = (status) => order.statusHistory?.findLast?.((h) => h.status === status)?.changedAt;

  return (
    <ol className="grid gap-4 sm:grid-cols-4">
      {FLOW.map((status, i) => {
        const done = i <= currentIndex;
        const date = historyDate(status);
        return (
          <li key={status} className="flex items-center gap-3 sm:flex-col sm:text-center">
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold',
                done ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-white/10 bg-white/5 text-slate-500',
              )}
            >
              {done ? <FaCheck /> : i + 1}
            </span>
            <div>
              <p className={cn('text-sm font-semibold', done ? 'text-white' : 'text-slate-500')}>{ORDER_STATUS_META[status].label}</p>
              {date && <p className="text-xs text-slate-500">{formatDate(date, true)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
