import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaImage } from 'react-icons/fa';
import { optimizeImage } from '../../utils/image';
import { cn } from '../../utils/format';

export const ProductGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);
  const current = images[active]?.url;

  return (
    <div className="grid gap-4">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/50">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.img
              key={current}
              src={optimizeImage(current, 1000)}
              alt={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              <FaImage size={48} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.publicId || img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Снимка ${i + 1}`}
              className={cn(
                'aspect-square overflow-hidden rounded-2xl border transition',
                i === active ? 'border-emerald-400' : 'border-white/10 opacity-70 hover:opacity-100',
              )}
            >
              <img src={optimizeImage(img.url, 200)} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
