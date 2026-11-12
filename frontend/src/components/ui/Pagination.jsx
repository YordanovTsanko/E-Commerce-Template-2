import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { cn } from '../../utils/format';

// Връща номерата на страниците с "..." при много страници
const getPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
};

const baseBtn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40';

export const Pagination = ({ page, pages, onChange, disabled = false }) => {
  if (!pages || pages <= 1) return null;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Страници">
      <button
        type="button"
        className={cn(baseBtn, 'border border-white/10 text-slate-200 hover:bg-white/10')}
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Предишна страница"
      >
        <HiChevronLeft size={18} />
      </button>

      {getPages(page, pages).map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="px-1 text-slate-500">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            disabled={disabled}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              baseBtn,
              p === page ? 'bg-emerald-400 text-slate-950' : 'border border-white/10 text-slate-200 hover:bg-white/10',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(baseBtn, 'border border-white/10 text-slate-200 hover:bg-white/10')}
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= pages}
        aria-label="Следваща страница"
      >
        <HiChevronRight size={18} />
      </button>
    </nav>
  );
};
