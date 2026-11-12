import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaImage } from 'react-icons/fa';
import { PriceTag } from './PriceTag';
import { RatingStars } from './RatingStars';
import { WishlistButton } from './WishlistButton';
import { AddToCartButton } from './AddToCartButton';
import { optimizeImage, getProductImage } from '../../utils/image';
import { getDiscountPercent } from '../../utils/format';

export const ProductCard = ({ product, index = 0 }) => {
  const image = getProductImage(product);
  const discount = getDiscountPercent(product.price, product.salePrice);
  const url = `/product/${product.slug || product._id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="group flex flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur transition hover:border-emerald-400/30"
    >
      <Link to={url} className="relative block overflow-hidden rounded-3xl bg-slate-950/50">
        <div className="aspect-square">
          {image ? (
            <img
              src={optimizeImage(image, 500)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              <FaImage size={36} />
            </div>
          )}
        </div>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg">-{discount}%</span>
          )}
          {product.stock <= 0 && (
            <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-slate-200">Изчерпан</span>
          )}
        </div>
        <WishlistButton product={product} className="absolute right-3 top-3" />
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        {product.category?.name && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{product.category.name}</p>
        )}
        <Link to={url} className="mt-2 line-clamp-2 text-lg font-semibold text-white transition hover:text-emerald-200">
          {product.name}
        </Link>
        {product.numReviews > 0 && <RatingStars value={product.rating} count={product.numReviews} className="mt-2" />}

        <div className="mt-auto pt-4">
          <PriceTag product={product} />
          <AddToCartButton product={product} size="sm" className="mt-3 w-full py-2.5" />
        </div>
      </div>
    </motion.article>
  );
};
