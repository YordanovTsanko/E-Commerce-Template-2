import { FaSearch } from 'react-icons/fa';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton, EmptyState, ErrorState } from '../ui';

export const ProductGrid = ({
  products = [],
  loading,
  error,
  onRetry,
  skeletonCount = 8,
  emptyTitle = 'Няма намерени продукти',
  emptyText = 'Опитайте с други филтри или друга ключова дума.',
  emptyAction,
  columns = 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}) => {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  if (loading) {
    return (
      <div className={`grid gap-5 ${columns}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState icon={<FaSearch size={20} />} title={emptyTitle} text={emptyText} action={emptyAction} />;
  }

  return (
    <div className={`grid gap-5 ${columns}`}>
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
};
