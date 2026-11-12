import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { cn } from '../../utils/format';

// Показва оценка (readOnly) или позволява избор (onChange)
export const RatingStars = ({ value = 0, count, onChange, size = 14, className = '' }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={cn('flex items-center gap-1 text-amber-300', className)}>
      {stars.map((star) => {
        const icon =
          value >= star ? <FaStar size={size} /> : value >= star - 0.5 ? <FaStarHalfAlt size={size} /> : <FaRegStar size={size} />;
        return onChange ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition hover:scale-110"
            aria-label={`${star} звезди`}
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        );
      })}
      {count !== undefined && <span className="ml-1 text-xs text-slate-400">({count})</span>}
    </div>
  );
};
