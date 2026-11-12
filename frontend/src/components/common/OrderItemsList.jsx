import { Link } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';
import { optimizeImage } from '../../utils/image';
import { formatPrice, formatQuantity } from '../../utils/format';

// Списък с продуктите в поръчка – използва се от клиента и от админа
export const OrderItemsList = ({ items, linkable = true }) => (
  <ul className="grid min-w-0 gap-3">
    {items.map((item) => {
      const thumb = item.image ? (
        <img src={optimizeImage(item.image, 120)} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950/60 text-slate-600">
          <FaImage />
        </span>
      );
      return (
        <li key={item.product} className="flex min-w-0 items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-3 sm:gap-4">
          {thumb}
          <div className="min-w-0 flex-1">
            {linkable ? (
              <Link to={`/product/${item.slug || item.product}`} className="line-clamp-2 break-words font-medium text-white hover:text-emerald-200">
                {item.name}
              </Link>
            ) : (
              <p className="line-clamp-2 break-words font-medium text-white">{item.name}</p>
            )}
            <p className="text-sm text-slate-400">
              {formatQuantity(item.quantity, item.unit)} × {formatPrice(item.finalPrice)}
              {item.finalPrice < item.price && <span className="ml-2 text-slate-500 line-through">{formatPrice(item.price)}</span>}
            </p>
          </div>
          <p className="shrink-0 whitespace-nowrap font-semibold text-white">{formatPrice(item.lineTotal)}</p>
        </li>
      );
    })}
  </ul>
);

export const OrderTotals = ({ order }) => {
  const rows = [
    ['Продукти', formatPrice(order.itemsPrice + (order.savings || 0))],
    ...(order.savings > 0 ? [['Отстъпка', `-${formatPrice(order.savings)}`]] : []),
    ['Доставка', order.shippingPrice === 0 ? 'Безплатна' : formatPrice(order.shippingPrice)],
    [`ДДС (${Math.round((order.taxRate || 0) * 100)}%${order.pricesIncludeTax ? ', включено' : ''})`, formatPrice(order.taxPrice)],
  ];
  return (
    <div className="grid gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 text-slate-300">
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
        <span>Общо</span>
        <span className="text-emerald-300">{formatPrice(order.totalPrice)}</span>
      </div>
    </div>
  );
};

export const ShippingAddressCard = ({ address }) => (
  <div className="grid min-w-0 gap-1 break-words text-sm text-slate-300">
    <p className="font-semibold text-white">{address.fullName}</p>
    <p>{address.street}</p>
    <p>
      {address.postalCode} {address.city}
    </p>
    <p>{address.phone}</p>
    <p className="break-all">{address.email}</p>
    {address.notes && <p className="mt-2 rounded-2xl bg-slate-950/40 p-3 text-slate-400">„{address.notes}“</p>}
  </div>
);
