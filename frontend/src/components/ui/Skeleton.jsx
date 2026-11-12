import { cn } from '../../utils/format';

export const Skeleton = ({ className = '' }) => <div className={cn('animate-pulse rounded-2xl bg-white/10', className)} />;

export const ProductCardSkeleton = () => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
    <Skeleton className="aspect-square w-full rounded-3xl" />
    <Skeleton className="mt-4 h-4 w-1/3" />
    <Skeleton className="mt-3 h-5 w-3/4" />
    <Skeleton className="mt-4 h-10 w-full" />
  </div>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="grid gap-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
);
