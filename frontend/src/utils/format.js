import { UNITS } from './constants';

let currency = 'EUR';

// Валутата идва от backend (/config) – задава се веднъж при зареждане
export const setCurrency = (value) => {
  if (value) currency = value;
};

export const formatPrice = (value) =>
  new Intl.NumberFormat('bg-BG', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(value) || 0);

export const formatDate = (value, withTime = false) =>
  value
    ? new Intl.DateTimeFormat('bg-BG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime && { hour: '2-digit', minute: '2-digit' }),
      }).format(new Date(value))
    : '—';

export const formatQuantity = (quantity, unit = 'piece') => {
  const value = unit === 'piece' ? quantity : Number(quantity).toLocaleString('bg-BG', { maximumFractionDigits: 3 });
  return `${value} ${UNITS[unit]?.label || ''}`.trim();
};

export const getDiscountPercent = (price, salePrice) =>
  salePrice && price ? Math.round((1 - salePrice / price) * 100) : 0;

export const getUserName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Потребител';

export const cn = (...classes) => classes.filter(Boolean).join(' ');
