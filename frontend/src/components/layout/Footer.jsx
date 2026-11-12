import { Link } from 'react-router-dom';
import { SITE, NAV_LINKS } from '../../config/site';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p>
          © {SITE.year} {SITE.name}. Всички права запазени.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="transition hover:text-emerald-300">
              {link.label}
            </Link>
          ))}
          <a href={`mailto:${SITE.contacts.email}`} className="transition hover:text-emerald-300">
            {SITE.contacts.email}
          </a>
        </nav>
      </div>
    </footer>
  );
};
