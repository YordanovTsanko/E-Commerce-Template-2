import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { optimizeImage } from '../../utils/image';
import { cn } from '../../utils/format';

const isExternal = (link) => /^https?:\/\//.test(link);

export const BannerSlider = ({ banners }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[index];
  if (!banner) return null;

  const cta = banner.link && banner.buttonText && (
    isExternal(banner.link) ? (
      <a href={banner.link} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
        {banner.buttonText}
      </a>
    ) : (
      <Link to={banner.link} className="mt-5 inline-flex rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
        {banner.buttonText}
      </Link>
    )
  );

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-[4/3] sm:aspect-[16/10]"
        >
          <img src={optimizeImage(banner.image.url, 1200)} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{banner.title}</h2>
            {banner.subtitle && <p className="mt-2 max-w-lg text-slate-200">{banner.subtitle}</p>}
            {cta}
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute right-5 top-5 flex gap-2">
          {banners.map((b, i) => (
            <button
              key={b._id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Банер ${i + 1}`}
              className={cn('h-2.5 rounded-full transition-all', i === index ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/40')}
            />
          ))}
        </div>
      )}
    </div>
  );
};
