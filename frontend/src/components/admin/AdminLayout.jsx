import { NavLink, Outlet } from 'react-router-dom';
import { FaBoxOpen, FaChartPie, FaImages, FaReceipt, FaTags, FaUsers } from 'react-icons/fa';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Табло', icon: <FaChartPie />, end: true },
  { to: '/admin/products', label: 'Продукти', icon: <FaBoxOpen /> },
  { to: '/admin/categories', label: 'Категории', icon: <FaTags /> },
  { to: '/admin/orders', label: 'Поръчки', icon: <FaReceipt /> },
  { to: '/admin/users', label: 'Потребители', icon: <FaUsers /> },
  { to: '/admin/banners', label: 'Банери', icon: <FaImages /> },
];

const linkClass = ({ isActive }) =>
  [
    'flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition',
    isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white',
  ].join(' ');

export const AdminLayout = () => (
  <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <nav className="flex gap-2 overflow-x-auto overscroll-x-contain rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 backdrop-blur lg:flex-col">
        {ADMIN_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <div className="grid min-w-0 content-start gap-6">
      <Outlet />
    </div>
  </div>
);
