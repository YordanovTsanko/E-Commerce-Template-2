import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { FaHeart } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button, EmptyState } from '../components/ui';
import { wishlistApi } from '../services/endpoints';
import { selectWishlistIds } from '../store/wishlistSlice';

const Wishlist = () => {
  const ids = useSelector(selectWishlistIds);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['wishlist'], queryFn: wishlistApi.list, staleTime: 0 });

  // Премахнатите от любими изчезват веднага, без нова заявка
  const products = useMemo(() => (data || []).filter((p) => ids.includes(p._id)), [data, ids]);

  return (
    <PageTransition title="Любими">
      <SectionTitle eyebrow="Профил" title="Любими продукти" description="Продуктите, които сте отбелязали със сърце." />
      {!isLoading && !error && !products.length ? (
        <EmptyState
          icon={<FaHeart size={20} />}
          title="Нямате любими продукти"
          text="Натиснете сърцето върху продукт, за да го запазите тук."
          action={<Button to="/shop">Към магазина</Button>}
        />
      ) : (
        <ProductGrid products={products} loading={isLoading} error={error} onRetry={refetch} skeletonCount={4} />
      )}
    </PageTransition>
  );
};

export default Wishlist;
