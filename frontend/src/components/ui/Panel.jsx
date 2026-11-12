import { cn } from '../../utils/format';

// Основната "стъклена" карта от дизайна
export const Panel = ({ as: Tag = 'div', className = '', children, ...props }) => (
  <Tag
    className={cn('rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur', className)}
    {...props}
  >
    {children}
  </Tag>
);

export const Card = ({ as: Tag = 'div', className = '', children, ...props }) => (
  <Tag className={cn('rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20', className)} {...props}>
    {children}
  </Tag>
);

export const Eyebrow = ({ children, className = '' }) => (
  <p className={cn('text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300', className)}>{children}</p>
);
