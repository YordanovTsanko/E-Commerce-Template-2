import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import { cn } from '../../utils/format';

// Търсачка в хедъра – пренасочва към /shop?search=...
export const HeaderSearch = ({ className = '', onSubmitted }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [value, setValue] = useState('');

  // Синхронизира полето с URL, когато сме в магазина
  useEffect(() => {
    setValue(pathname === '/shop' ? params.get('search') || '' : '');
  }, [pathname, params]);

  const submit = (e) => {
    e.preventDefault();
    const term = value.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} role="search" className={cn('relative', className)}>
      <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Търсене на продукти..."
        aria-label="Търсене на продукти"
        className="w-full rounded-full border border-white/10 bg-slate-950/50 py-2 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
      />
    </form>
  );
};
