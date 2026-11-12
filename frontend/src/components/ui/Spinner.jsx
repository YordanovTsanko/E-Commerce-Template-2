import { cn } from '../../utils/format';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <span
      role="status"
      aria-label="Зареждане"
      className={cn('inline-block animate-spin rounded-full border-current border-t-transparent', sizes[size], className)}
    />
  );
};

export const FullPageLoader = ({ label = 'Зареждане...' }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-emerald-300">
    <Spinner size="lg" />
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);
