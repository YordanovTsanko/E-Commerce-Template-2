import { FaExclamationTriangle, FaInbox } from 'react-icons/fa';
import { Button } from './Button';
import { Panel } from './Panel';

export const EmptyState = ({ icon = <FaInbox size={22} />, title, text, action }) => (
  <Panel className="flex flex-col items-center gap-3 py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{icon}</div>
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    {text && <p className="max-w-md text-slate-400">{text}</p>}
    {action && <div className="mt-2">{action}</div>}
  </Panel>
);

export const ErrorState = ({ error, onRetry, title = 'Възникна грешка при зареждането' }) => (
  <Panel className="flex flex-col items-center gap-3 py-10 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-300">
      <FaExclamationTriangle size={22} />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="max-w-md text-slate-400">{error?.message || 'Моля, опитайте отново.'}</p>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Опитай отново
      </Button>
    )}
  </Panel>
);
