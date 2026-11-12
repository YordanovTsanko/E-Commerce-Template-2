import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaHeadset, FaLeaf, FaLock, FaTruck, FaArrowRight, FaTags } from 'react-icons/fa';
import { SectionTitle } from '../components/common/SectionTitle';
import { FeatureCard } from '../components/common/FeatureCard';
import { BannerSlider } from '../components/common/BannerSlider';
import { ProductGrid } from '../components/product/ProductGrid';
import { Skeleton, Eyebrow } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';
import { useStoreConfig } from '../hooks/useStoreConfig';
import { productApi, categoryApi, bannerApi } from '../services/endpoints';
import { optimizeImage } from '../utils/image';
import { formatPrice } from '../utils/format';
import { SITE } from '../config/site';

const SectionHeader = ({ eyebrow, title, to, linkLabel = 'Виж всички' }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
    </div>
    {to && (
      <Link to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
        {linkLabel} <FaArrowRight size={12} />
      </Link>
    )}
  </div>
);

const Home = () => {
  usePageTitle();
  const config = useStoreConfig();

  const banners = useQuery({ queryKey: ['banners'], queryFn: () => bannerApi.list() });
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() });
  const featured = useQuery({
    queryKey: ['products', { featured: true, limit: 4 }],
    queryFn: () => productApi.list({ featured: true, limit: 4 }),
  });
  const latest = useQuery({
    queryKey: ['products', { sort: 'newest', limit: 8 }],
    queryFn: () => productApi.list({ sort: 'newest', limit: 8 }),
  });

  const features = [
    {
      icon: <FaTruck size={20} />,
      title: 'Бърза доставка',
      text:
        config.freeShippingThreshold > 0
          ? `Безплатна доставка за поръчки над ${formatPrice(config.freeShippingThreshold)}.`
          : 'Доставяме бързо до всеки адрес в страната.',
    },
    { icon: <FaLock size={20} />, title: 'Сигурно пазаруване', text: 'Защитени профили и плащане с наложен платеж при доставка.' },
    { icon: <FaLeaf size={20} />, title: 'Качествени продукти', text: 'Подбираме внимателно всеки продукт, който предлагаме.' },
    { icon: <FaHeadset size={20} />, title: 'Грижа за клиента', text: 'Свържете се с нас по всяко време – отговаряме бързо.' },
  ];

  const hasBanners = banners.data?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="grid gap-12 lg:gap-16"
    >
      {/* HERO */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionTitle eyebrow={SITE.name} title={SITE.tagline} description={SITE.description} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Към магазина
            </Link>
            <Link
              to="/shop?onSale=true"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10"
            >
              <FaTags /> Промоции
            </Link>
          </div>
        </div>

        {banners.isLoading ? (
          <Skeleton className="aspect-[16/10] w-full rounded-[2rem]" />
        ) : hasBanners ? (
          <BannerSlider banners={banners.data} />
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-3xl bg-slate-950/50 p-5">
                  <div className="text-emerald-300">{f.icon}</div>
                  <div className="mt-3 text-lg font-bold text-white">{f.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* КАТЕГОРИИ */}
      {(categories.isLoading || categories.data?.length > 0) && (
        <section>
          <SectionHeader eyebrow="Категории" title="Разгледайте по категория" to="/shop" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-3xl" />)
              : categories.data.slice(0, 12).map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${cat.slug}`}
                    className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/40"
                  >
                    {cat.image?.url ? (
                      <img
                        src={optimizeImage(cat.image.url, 400)}
                        alt={cat.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-80"
                      />
                    ) : (
                      <FaLeaf className="absolute right-4 top-4 text-emerald-300/40" size={28} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
                    <div className="relative">
                      <p className="font-semibold text-white">{cat.name}</p>
                      <p className="text-xs text-slate-400">{cat.productCount} продукта</p>
                    </div>
                  </Link>
                ))}
          </div>
        </section>
      )}

      {/* ПРЕПОРЪЧАНИ */}
      {(featured.isLoading || featured.data?.items.length > 0) && (
        <section>
          <SectionHeader eyebrow="Препоръчани" title="Нашият избор за вас" to="/shop?featured=true" />
          <ProductGrid products={featured.data?.items} loading={featured.isLoading} error={featured.error} skeletonCount={4} />
        </section>
      )}

      {/* НОВИ */}
      <section>
        <SectionHeader eyebrow="Ново" title="Последно добавени" to="/shop" />
        <ProductGrid
          products={latest.data?.items}
          loading={latest.isLoading}
          error={latest.error}
          onRetry={latest.refetch}
          emptyTitle="Все още няма продукти"
          emptyText="Скоро ще добавим първите продукти в магазина."
        />
      </section>

      {/* ПРЕДИМСТВА */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} delay={index * 0.05} {...feature} />
        ))}
      </section>
    </motion.div>
  );
};

export default Home;
