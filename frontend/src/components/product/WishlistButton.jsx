import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { selectIsFavorite, selectWishlistPending, toggleWishlist } from '../../store/wishlistSlice';
import { selectUser } from '../../store/authSlice';
import { Spinner } from '../ui';
import { cn } from '../../utils/format';

export const WishlistButton = ({ product, className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isFavorite = useSelector(selectIsFavorite(product._id));
  const pending = useSelector(selectWishlistPending(product._id));

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Влезте в профила си, за да добавяте в любими', { icon: '💚' });
      navigate('/login', { state: { from: location } });
      return;
    }
    dispatch(toggleWishlist(product));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Премахни от любими' : 'Добави в любими'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur transition hover:bg-white/10 disabled:opacity-60',
        isFavorite ? 'text-rose-300' : 'text-slate-200',
        className,
      )}
    >
      {pending ? <Spinner size="sm" /> : isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};
