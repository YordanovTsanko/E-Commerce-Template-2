import { formatPrice, getDiscountPercent, cn } from '../../utils/format';
import { UNITS } from '../../utils/constants';

export const PriceTag = ({ product, size = 'md', showUnit = true, className = '' }) => {
  const onSale = product.salePrice !== null && product.salePrice !== undefined;
  const current = onSale ? product.salePrice : product.price;
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-bold text-white', sizes[size])}>{formatPrice(current)}</span>
      {showUnit && product.unit && product.unit !== 'piece' && (
        <span className="text-sm text-slate-400">/ {UNITS[product.unit]?.label}</span>
      )}
      {onSale && (
        <>
          <span className="text-sm text-slate-500 line-through">{formatPrice(product.price)}</span>
          <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-xs font-semibold text-rose-200">
            -{getDiscountPercent(product.price, product.salePrice)}%
          </span>
        </>
      )}
    </div>
  );
};
