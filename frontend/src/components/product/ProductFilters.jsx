import { useEffect, useState } from 'react';
import { FaFilter, FaStar } from 'react-icons/fa';
import { Panel, Button, Checkbox, Input, Skeleton } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/format';

const RATINGS = [4, 3, 2];

const FilterGroup = ({ title, children }) => (
  <div className="grid gap-3 border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3>
    {children}
  </div>
);

const optionClass = (active) =>
  cn(
    'flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition',
    active ? 'bg-emerald-400/15 text-emerald-200' : 'text-slate-300 hover:bg-white/5',
  );

export const ProductFilters = ({ filters, onChange, onReset, categories = [], categoriesLoading, activeCount }) => {
  // Локално състояние за цените, за да не се прави заявка при всеки символ
  const [price, setPrice] = useState({ minPrice: filters.minPrice, maxPrice: filters.maxPrice });
  const debouncedPrice = useDebounce(price, 600);

  useEffect(() => {
    setPrice({ minPrice: filters.minPrice, maxPrice: filters.maxPrice });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (debouncedPrice.minPrice !== filters.minPrice || debouncedPrice.maxPrice !== filters.maxPrice) {
      onChange(debouncedPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrice]);

  return (
    <Panel className="grid gap-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <FaFilter className="text-emerald-300" size={14} /> Филтри
        </h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Изчисти ({activeCount})
          </Button>
        )}
      </div>

      <FilterGroup title="Категории">
        {categoriesLoading ? (
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : (
          <div className="grid gap-1">
            <button type="button" className={optionClass(!filters.category)} onClick={() => onChange({ category: '' })}>
              Всички
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                className={optionClass(filters.category === cat.slug)}
                onClick={() => onChange({ category: cat.slug })}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-slate-500">{cat.productCount}</span>
              </button>
            ))}
          </div>
        )}
      </FilterGroup>

      <FilterGroup title="Цена">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            min="0"
            placeholder="От"
            value={price.minPrice}
            onChange={(e) => setPrice((p) => ({ ...p, minPrice: e.target.value }))}
            aria-label="Минимална цена"
          />
          <Input
            type="number"
            min="0"
            placeholder="До"
            value={price.maxPrice}
            onChange={(e) => setPrice((p) => ({ ...p, maxPrice: e.target.value }))}
            aria-label="Максимална цена"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Оценка">
        <div className="grid gap-1">
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              className={optionClass(Number(filters.rating) === r)}
              onClick={() => onChange({ rating: Number(filters.rating) === r ? '' : String(r) })}
            >
              <span className="flex items-center gap-2">
                <FaStar className="text-amber-300" /> {r} и повече
              </span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Наличност">
        <Checkbox
          label="Само налични"
          checked={filters.inStock === 'true'}
          onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })}
        />
        <Checkbox
          label="Само в промоция"
          checked={filters.onSale === 'true'}
          onChange={(e) => onChange({ onSale: e.target.checked ? 'true' : '' })}
        />
      </FilterGroup>
    </Panel>
  );
};
