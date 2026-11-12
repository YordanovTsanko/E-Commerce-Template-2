import { Link } from 'react-router-dom';
import { Spinner } from './Spinner';
import { cn } from '../../utils/format';

// Стиловете са взети директно от оригиналния дизайн
const VARIANTS = {
  primary: 'bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300',
  secondary: 'border border-white/10 font-medium text-slate-100 hover:bg-white/10',
  outline: 'border border-emerald-400/30 font-medium text-emerald-200 hover:bg-emerald-400/10',
  danger: 'border border-rose-400/30 font-medium text-rose-200 hover:bg-rose-400/10',
  ghost: 'font-medium text-slate-300 hover:bg-white/10 hover:text-white',
};

const SIZES = {
  sm: 'rounded-xl px-3 py-2 text-sm',
  md: 'rounded-2xl px-5 py-3',
  icon: 'rounded-2xl p-3',
  iconSm: 'rounded-xl p-2',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  to,
  href,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
      {content}
    </button>
  );
};
