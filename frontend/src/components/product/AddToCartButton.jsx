import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingBag } from 'react-icons/fa';
import { addToCart, selectCartPending } from '../../store/cartSlice';
import { Button } from '../ui';

export const AddToCartButton = ({ product, quantity = 1, className = '', size = 'md', label = 'Добави в количката' }) => {
  const dispatch = useDispatch();
  const pending = useSelector(selectCartPending(product._id));
  const outOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      className={className}
      loading={pending}
      disabled={outOfStock}
      icon={<FaShoppingBag />}
      onClick={(e) => {
        e.preventDefault();
        dispatch(addToCart({ product, quantity }));
      }}
    >
      {outOfStock ? 'Изчерпан' : label}
    </Button>
  );
};
