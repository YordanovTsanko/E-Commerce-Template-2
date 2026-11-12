import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBoxOpen, FaHeart, FaSignOutAlt, FaTachometerAlt, FaUser } from 'react-icons/fa';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { getUserName } from '../../utils/format';
import { ROLES } from '../../utils/constants';

export const USER_LINKS = [
  { to: '/profile', label: 'Моят профил', icon: <FaUser /> },
  { to: '/orders', label: 'Моите поръчки', icon: <FaBoxOpen /> },
  { to: '/wishlist', label: 'Любими', icon: <FaHeart /> },
];

export const ADMIN_LINK = { to: '/admin', label: 'Админ панел', icon: <FaTachometerAlt /> };

export const UserMenu = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const links = isAdmin ? [...USER_LINKS, ADMIN_LINK] : USER_LINKS;
  const itemClass = 'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-2xl border border-white/10 p-1 pr-3 transition hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-medium text-slate-100 lg:inline">{user.firstName || 'Профил'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64 rounded-3xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate font-semibold text-white">{getUserName(user)}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              {isAdmin && <p className="mt-1 text-xs font-medium text-emerald-300">{ROLES[user.role]}</p>}
            </div>
            <div className="grid gap-1 py-2">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className={itemClass} onClick={() => setOpen(false)} role="menuitem">
                  <span className="text-emerald-300">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className={`${itemClass} w-full border-t border-white/10 pt-3 text-rose-200`}
              role="menuitem"
            >
              <FaSignOutAlt /> Изход
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
