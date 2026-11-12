import { FaTruck } from 'react-icons/fa';
import { Panel } from '../ui';
import { formatPrice } from '../../utils/format';

const Row = ({ label, value, className = 'text-slate-300' }) => (
  <div className={`flex items-center justify-between gap-4 ${className}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export const CartSummary = ({ totals, title = 'Обобщение', children }) => (
  <Panel className="grid gap-4 lg:sticky lg:top-28">
    <h2 className="text-xl font-semibold text-white">{title}</h2>

    {totals.amountToFreeShipping > 0 && (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
        <FaTruck className="mt-0.5 shrink-0" />
        <span>
          Добавете още <b>{formatPrice(totals.amountToFreeShipping)}</b> за безплатна доставка.
        </span>
      </div>
    )}

    <div className="grid gap-2 text-sm">
      <Row label="Продукти" value={formatPrice(totals.subtotal + totals.savings)} />
      {totals.savings > 0 && <Row label="Отстъпка" value={`-${formatPrice(totals.savings)}`} className="text-rose-200" />}
      <Row label="Доставка" value={totals.shipping === 0 ? 'Безплатна' : formatPrice(totals.shipping)} />
      <Row
        label={`ДДС (${Math.round(totals.taxRate * 100)}%${totals.pricesIncludeTax ? ', включено' : ''})`}
        value={formatPrice(totals.tax)}
        className="text-slate-400"
      />
    </div>

    <div className="flex items-center justify-between border-t border-white/10 pt-4">
      <span className="text-lg font-semibold text-white">Общо</span>
      <span className="text-2xl font-bold text-emerald-300">{formatPrice(totals.total)}</span>
    </div>

    {children}
  </Panel>
);
