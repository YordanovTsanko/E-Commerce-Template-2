import { FaLeaf } from 'react-icons/fa';
import { PageTransition } from './PageTransition';
import { Panel } from '../ui';

// Обща рамка за вход, регистрация, забравена парола и т.н.
export const AuthCard = ({ title, subtitle, pageTitle, children, footer }) => (
  <PageTransition title={pageTitle || title} className="mx-auto grid w-full max-w-md gap-6 py-6">
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30">
        <FaLeaf size={22} />
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
    </div>
    <Panel className="grid gap-5">{children}</Panel>
    {footer && <div className="text-center text-sm text-slate-400">{footer}</div>}
  </PageTransition>
);
