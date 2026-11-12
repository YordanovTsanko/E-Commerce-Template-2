import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters } from '../components/product/ProductFilters';
import { Button, Pagination, Select, Spinner, inputClass } from '../components/ui';
import { productApi, categoryApi } from '../services/endpoints';
import { useDebounce } from '../hooks/useDebounce';
import { SORT_OPTIONS, PAGE_SIZES } from '../utils/constants';
import { cn } from '../utils/format';

const FILTER_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'inStock', 'onSale', 'rating', 'featured'];
const DEFAULTS = { sort: 'newest', page: '1', limit: '12' };

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Всички филтри живеят в URL-а (споделими линкове, бутон "назад")
  const filters = useMemo(() => {
    const result = { ...DEFAULTS };
    FILTER_KEYS.forEach((key) => {
      result[key] = params.get(key) || '';
    });
    ['sort', 'page', 'limit'].forEach((key) => {
      if (params.get(key)) result[key] = params.get(key);
    });
    return result;
  }, [params]);

  const updateFilters = (changes, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries({ ...changes, ...(resetPage && { page: '1' }) }).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null || value === DEFAULTS[key]) next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };

  const resetFilters = () => setParams(new URLSearchParams());

  // Търсене в реално време с debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);
  useEffect(() => setSearchInput(filters.search), [filters.search]);
  useEffect(() => {
    if (debouncedSearch !== filters.search) updateFilters({ search: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const categories = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() });

  const activeCount = FILTER_KEYS.filter((key) => key !== 'search' && filters[key]).length;
  const pagination = data?.pagination;
  const currentCategory = categories.data?.find((c) => c.slug === filters.category);

  const changePage = (page) => {
    updateFilters({ page: String(page) }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageTransition title={currentCategory?.name || 'Магазин'}>
      <SectionTitle
        eyebrow="Магазин"
        title={currentCategory?.name || 'Всички продукти'}
        description={currentCategory?.description || 'Разгледайте нашия асортимент, филтрирайте и намерете точно това, което търсите.'}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Филтри */}
        <aside className={cn('lg:block', showFilters ? 'block' : 'hidden')}>
          <ProductFilters
            filters={filters}
            onChange={(changes) => updateFilters(changes)}
            onReset={resetFilters}
            categories={categories.data}
            categoriesLoading={categories.isLoading}
            activeCount={activeCount}
          />
        </aside>

        <div className="grid min-w-0 content-start gap-6">
          {/* Лента с търсене и сортиране */}
          <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Търсене по име, описание, марка..."
                aria-label="Търсене"
                className={cn(inputClass, 'pl-11 pr-10')}
              />
              {isFetching && !isLoading && (
                <Spinner size="sm" className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />
              )}
            </div>
            <div className="flex gap-3">
              <Select
                aria-label="Сортиране"
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                options={SORT_OPTIONS}
                className="min-w-48 flex-1"
              />
              <Select
                aria-label="Продукти на страница"
                value={filters.limit}
                onChange={(e) => updateFilters({ limit: e.target.value })}
                options={PAGE_SIZES.map((n) => ({ value: String(n), label: `${n} / стр.` }))}
                className="w-28"
              />
              <Button
                variant="secondary"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Филтри"
              >
                {showFilters ? <HiOutlineX size={20} /> : <HiOutlineAdjustments size={20} />}
              </Button>
            </div>
          </div>

          {pagination && (
            <p className="text-sm text-slate-400">
              {pagination.total === 0
                ? 'Няма резултати'
                : `Показани ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )} от ${pagination.total} продукта`}
              {filters.search && (
                <>
                  {' '}
                  за „<span className="text-emerald-300">{filters.search}</span>“
                </>
              )}
            </p>
          )}

          <div className={cn('transition', isFetching && !isLoading && 'opacity-60')}>
            <ProductGrid
              products={data?.items}
              loading={isLoading}
              error={error}
              onRetry={refetch}
              columns="sm:grid-cols-2 xl:grid-cols-3"
              skeletonCount={6}
              emptyAction={
                (activeCount > 0 || filters.search) && (
                  <Button variant="secondary" onClick={resetFilters}>
                    Изчисти филтрите
                  </Button>
                )
              }
            />
          </div>

          {pagination && (
            <Pagination page={pagination.page} pages={pagination.pages} onChange={changePage} disabled={isFetching} />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Shop;
