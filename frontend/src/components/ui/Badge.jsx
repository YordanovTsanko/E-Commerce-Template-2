import { cn } from '../../utils/format';

const TONES = {
  emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  rose: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  sky: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  slate: 'border-white/10 bg-white/5 text-slate-300',
};

export const Badge = ({ tone = 'slate', className = '', children }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium', TONES[tone], className)}>
    {children}
  </span>
);

// Badge по речник { value: { label, tone } }
export const StatusBadge = ({ value, meta }) => {
  const item = meta[value] || { label: value, tone: 'slate' };
  return <Badge tone={item.tone}>{item.label}</Badge>;
};
