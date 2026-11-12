export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const ORDER_STATUS_META = {
  Pending: { label: 'Изчакваща', tone: 'amber' },
  Processing: { label: 'Обработва се', tone: 'sky' },
  Shipped: { label: 'Изпратена', tone: 'violet' },
  Delivered: { label: 'Доставена', tone: 'emerald' },
  Cancelled: { label: 'Отказана', tone: 'rose' },
};

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

export const PAYMENT_STATUS_META = {
  Pending: { label: 'Очаква плащане', tone: 'amber' },
  Paid: { label: 'Платена', tone: 'emerald' },
  Failed: { label: 'Неуспешно', tone: 'rose' },
  Refunded: { label: 'Възстановена', tone: 'slate' },
};

export const PAYMENT_METHODS = {
  cod: { label: 'Наложен платеж', description: 'Плащате в брой или с карта на куриера при доставка.' },
  card: {
    label: 'Карта (онлайн)',
    description: 'Онлайн плащането с карта ще бъде активирано скоро. Поръчката ще изчаква потвърждение.',
  },
};

export const UNITS = {
  piece: { label: 'бр.', long: 'брой', step: 1 },
  kg: { label: 'кг', long: 'килограм', step: 0.1 },
  l: { label: 'л', long: 'литър', step: 0.1 },
};

export const ROLES = {
  user: 'Потребител',
  admin: 'Администратор',
  superAdmin: 'Супер администратор',
};

export const USER_STATUSES = {
  active: { label: 'Активен', tone: 'emerald' },
  pending: { label: 'Непотвърден', tone: 'amber' },
  suspended: { label: 'Спрян', tone: 'violet' },
  banned: { label: 'Блокиран', tone: 'rose' },
  inactive: { label: 'Неактивен', tone: 'slate' },
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Най-нови' },
  { value: 'price_asc', label: 'Цена: ниска към висока' },
  { value: 'price_desc', label: 'Цена: висока към ниска' },
  { value: 'rating', label: 'Най-висока оценка' },
  { value: 'popular', label: 'Най-продавани' },
  { value: 'name_asc', label: 'Име (А-Я)' },
];

export const PAGE_SIZES = [12, 24, 48];
