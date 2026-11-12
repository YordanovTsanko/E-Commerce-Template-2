import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaImage, FaTrash } from 'react-icons/fa';
import { removeFromCart, selectCartPending, updateCartItem } from '../../store/cartSlice';
import { QuantityStepper } from '../product/QuantityStepper';
import { PriceTag } from '../product/PriceTag';
import { Button, Spinner } from '../ui';
import { formatPrice } from '../../utils/format';
import { getFinalPrice } from '../../utils/pricing';
import { optimizeImage, getProductImage } from '../../utils/image';

export const CartItemRow = ({ item }) => {
  const dispatch = useDispatch();
  const { product, quantity } = item;
  const pending = useSelector(selectCartPending(product._id));
  const image = getProductImage(product);
  const url = `/product/${product.slug || product._id}`;

  return (
    <article className="relative flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center">
      <Link to={url} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-950/60">
        {image ? (
          <img src={optimizeImage(image, 200)} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <FaImage />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={url} className="line-clamp-2 font-semibold text-white hover:text-emerald-200">
          {product.name}
        </Link>
        <PriceTag product={product} size="sm" className="mt-1" />
        {quantity > product.stock && (
          <p className="mt-1 text-xs text-amber-300">Налични са само {product.stock}. Намалете количеството.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <QuantityStepper
          value={quantity}
          unit={product.unit}
          max={product.stock}
          disabled={pending}
          onChange={(q) => dispatch(updateCartItem({ productId: product._id, quantity: q }))}
        />
        <p className="w-24 text-right font-bold text-white">{formatPrice(getFinalPrice(product) * quantity)}</p>
        <Button
          variant="danger"
          size="iconSm"
          disabled={pending}
          aria-label="Премахни"
          onClick={() => dispatch(removeFromCart(product._id))}
        >
          {pending ? <Spinner size="sm" /> : <FaTrash size={12} />}
        </Button>
      </div>
    </article>
  );
};
