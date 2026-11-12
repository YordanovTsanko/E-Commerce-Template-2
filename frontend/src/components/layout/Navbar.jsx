import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import { FaHeart, FaLeaf, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa';
import { NAV_LINKS, SITE } from '../../config/site';
import { selectCartCount } from '../../store/cartSlice';
import { selectWishlistCount } from '../../store/wishlistSlice';
import { useAuth } from '../../hooks/useAuth';
import { HeaderSearch } from './HeaderSearch';
import { UserMenu, USER_LINKS, ADMIN_LINK } from './UserMenu';

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white',
  ].join(' ');

const IconLink = ({ to, label, count, children }) => (
  <Link
    to={to}
    aria-label={label}
    className="relative inline-flex items-center justify-center rounded-2xl border border-white/10 p-3 text-slate-100 transition hover:bg-white/10"
  >
    {children}
    {count > 0 && (
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[11px] font-bold text-slate-950">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </Link>
);

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);

  useEffect(() => setOpen(false), [pathname]);

  const mobileLinks = user ? [...NAV_LINKS, ...USER_LINKS, ...(isAdmin ? [ADMIN_LINK] : [])] : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30">
            <FaLeaf />
          </span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <HeaderSearch className="hidden w-full max-w-xs md:block" />

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:inline-flex">
              <IconLink to="/wishlist" label="Любими" count={wishlistCount}>
                <FaHeart size={16} />
              </IconLink>
            </span>
          )}
          <IconLink to="/cart" label="Количка" count={cartCount}>
            <FaShoppingBag size={16} />
          </IconLink>

          {user ? (
            <span className="hidden md:block">
              <UserMenu />
            </span>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/login" className={linkClass}>
                Вход
              </NavLink>
              <Link
                to="/register"
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Регистрация
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 p-3 text-slate-100 transition hover:bg-white/10 lg:hidden"
            aria-label="Отвори менюто"
            aria-expanded={open}
          >
            {open ? <HiOutlineX size={22} /> : <HiOutlineMenuAlt3 size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 pt-4">
            <HeaderSearch className="mb-2 md:hidden" />
            {mobileLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-left text-sm font-medium text-rose-200 transition hover:bg-white/10 md:hidden"
              >
                <FaSignOutAlt /> Изход
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:hidden">
                <NavLink to="/login" className={linkClass}>
                  Вход
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Регистрация
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
