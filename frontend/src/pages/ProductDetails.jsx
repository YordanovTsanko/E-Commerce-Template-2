import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaCheckCircle, FaChevronRight, FaTruck, FaUndo } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { ProductGallery } from '../components/product/ProductGallery';
import { PriceTag } from '../components/product/PriceTag';
import { RatingStars } from '../components/product/RatingStars';
import { QuantityStepper } from '../components/product/QuantityStepper';
import { AddToCartButton } from '../components/product/AddToCartButton';
import { WishlistButton } from '../components/product/WishlistButton';
import { ReviewSection } from '../components/product/ReviewSection';
import { ProductGrid } from '../components/product/ProductGrid';
import { Panel, Badge, Skeleton, ErrorState, Eyebrow } from '../components/ui';
import { productApi } from '../services/endpoints';
import { UNITS } from '../utils/constants';
import { formatQuantity } from '../utils/format';
import NotFound from './NotFound';

const DetailsSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <Skeleton className="aspect-square w-full rounded-[2rem]" />
    <div className="grid content-start gap-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-1/2" />
    </div>
  </div>
);

const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const [quantity, setQuantity] = useState(1);
  useEffect(() => setQuantity(1), [idOrSlug]);

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => productApi.get(idOrSlug),
    retry: (count, err) => err.response?.status !== 404 && count < 1,
  });

  const related = useQuery({
    queryKey: ['related', idOrSlug],
    queryFn: () => productApi.related(idOrSlug),
    enabled: Boolean(product),
  });

  if (error?.response?.status === 404) return <NotFound title="Продуктът не е намерен" />;

  return (
    <PageTransition title={product?.name || 'Продукт'} className="grid gap-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400" aria-label="Навигация">
        <Link to="/" className="hover:text-emerald-300">
          Начало
        </Link>
        <FaChevronRight size={10} />
        <Link to="/shop" className="hover:text-emerald-300">
          Магазин
        </Link>
        {product?.category && (
          <>
            <FaChevronRight size={10} />
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-emerald-300">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      {isLoading ? (
        <DetailsSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-2">
            <ProductGallery images={product.images} name={product.name} />

            <div className="grid content-start gap-6">
              <div>
                {product.brand && <Eyebrow>{product.brand}</Eyebrow>}
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{product.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <RatingStars value={product.rating} count={product.numReviews} />
                  {product.stock > 0 ? (
                    <Badge tone="emerald">
                      <FaCheckCircle /> В наличност ({formatQuantity(product.stock, product.unit)})
                    </Badge>
                  ) : (
                    <Badge tone="rose">Изчерпан</Badge>
                  )}
                </div>
              </div>

              <PriceTag product={product} size="lg" />

              <p className="whitespace-pre-line leading-7 text-slate-300">{product.description}</p>

              {product.stock > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityStepper value={quantity} onChange={setQuantity} unit={product.unit} max={product.stock} />
                  <span className="text-sm text-slate-400">{UNITS[product.unit]?.long}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <AddToCartButton product={product} quantity={quantity} className="flex-1 sm:flex-none" />
                <WishlistButton product={product} className="h-12 w-12" />
              </div>

              {product.features?.length > 0 && (
                <Panel className="grid gap-3 p-5">
                  <h2 className="font-semibold text-white">Характеристики</h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                        <FaCheckCircle className="mt-1 shrink-0 text-emerald-300" size={12} /> {feature}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <FaTruck className="text-emerald-300" /> Бърза доставка до адрес
                </div>
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <FaUndo className="text-emerald-300" /> Връщане до 14 дни
                </div>
              </div>

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link key={tag} to={`/shop?search=${encodeURIComponent(tag)}`}>
                      <Badge>#{tag}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ReviewSection product={product} />

          {related.data?.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-white">Подобни продукти</h2>
              <ProductGrid products={related.data} />
            </section>
          )}
        </>
      )}
    </PageTransition>
  );
};

export default ProductDetails;
