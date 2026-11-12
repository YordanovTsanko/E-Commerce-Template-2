import { Eyebrow } from '../ui';
import { usePageTitle } from '../../hooks/usePageTitle';

export const AdminPageHeader = ({ title, description, actions }) => {
  usePageTitle(`${title} · Админ`);
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Eyebrow>Админ панел</Eyebrow>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
};
