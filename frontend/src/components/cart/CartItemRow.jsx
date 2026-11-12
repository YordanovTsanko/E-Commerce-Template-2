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

  const removeButton = (wrapClass) => (
    <span className={wrapClass}>
      <Button
        variant="danger"
        size="iconSm"
        disabled={pending}
        aria-label="Премахни"
        onClick={() => dispatch(removeFromCart(product._id))}
      >
        {pending ? <Spinner size="sm" /> : <FaTrash size={12} />}
      </Button>
    </span>
  );

  return (
    <article className="relative flex min-w-0 flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      {/* Снимка + име (+ кошче на мобилно) */}
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <Link to={url} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-950/60 sm:h-24 sm:w-24">
          {image ? (
            <img src={optimizeImage(image, 200)} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              <FaImage />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link to={url} className="line-clamp-2 break-words font-semibold text-white hover:text-emerald-200">
            {product.name}
          </Link>
          <PriceTag product={product} size="sm" className="mt-1" />
          {quantity > product.stock && (
            <p className="mt-1 text-xs text-amber-300">Налични са само {product.stock}. Намалете количеството.</p>
          )}
        </div>

        {removeButton('shrink-0 sm:hidden')}
      </div>

      {/* Количество + сума (+ кошче на десктоп) */}
      <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <QuantityStepper
          value={quantity}
          unit={product.unit}
          max={product.stock}
          disabled={pending}
          onChange={(q) => dispatch(updateCartItem({ productId: product._id, quantity: q }))}
          className="shrink-0"
        />
        <p className="min-w-0 truncate text-right font-bold text-white sm:w-24">{formatPrice(getFinalPrice(product) * quantity)}</p>
        {removeButton('hidden shrink-0 sm:block')}
      </div>
    </article>
  );
};
