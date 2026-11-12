// Основни настройки на сайта – сменете тук името, контактите и навигацията.
export const SITE = {
  name: 'Магазин',
  tagline: 'Свежи продукти, доставени до вашата врата',
  description: 'Онлайн магазин с бърза доставка, сигурно пазаруване и грижа за всеки клиент.',
  contacts: {
    email: 'hello@example.bg',
    phone: '+359 888 123 456',
    location: 'София, България',
  },
  year: new Date().getFullYear(),
};

export const NAV_LINKS = [
  { to: '/', label: 'Начало', end: true },
  { to: '/shop', label: 'Магазин' },
  { to: '/about', label: 'За нас' },
  { to: '/contact', label: 'Контакт' },
];

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
