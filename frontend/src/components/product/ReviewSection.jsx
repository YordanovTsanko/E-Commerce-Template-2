import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaCheckCircle, FaTrash } from 'react-icons/fa';
import { reviewApi } from '../../services/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { Panel, Button, Textarea, Skeleton, Pagination, Badge } from '../ui';
import { RatingStars } from './RatingStars';
import { Avatar } from '../common/Avatar';
import { formatDate, getUserName } from '../../utils/format';

const ReviewForm = ({ productId, myReview, onSaved }) => {
  const [rating, setRating] = useState(myReview?.rating || 0);
  const [comment, setComment] = useState(myReview?.comment || '');

  const mutation = useMutation({
    mutationFn: () => reviewApi.upsert(productId, { rating, comment }),
    meta: { successMessage: myReview ? 'Отзивът е обновен' : 'Благодарим за отзива!' },
    onSuccess: onSaved,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="grid gap-2 text-sm text-slate-300">
        <span>Вашата оценка</span>
        <RatingStars value={rating} onChange={setRating} size={22} />
      </div>
      <Textarea
        label="Коментар (по желание)"
        rows={3}
        value={comment}
        maxLength={2000}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Споделете впечатленията си от продукта..."
      />
      <div>
        <Button type="submit" loading={mutation.isPending} disabled={!rating}>
          {myReview ? 'Обнови отзива' : 'Публикувай отзив'}
        </Button>
      </div>
    </form>
  );
};

export const ReviewSection = ({ product }) => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', product._id, page],
    queryFn: () => reviewApi.list(product._id, { page, limit: 5 }),
    placeholderData: (prev) => prev,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', product._id] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
  };

  const deleteMutation = useMutation({
    mutationFn: reviewApi.remove,
    meta: { successMessage: 'Отзивът е изтрит' },
    onSuccess: refresh,
  });

  const reviews = data?.items || [];
  const myReview = user && reviews.find((r) => r.user?._id === user._id);

  return (
    <Panel className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Отзиви</h2>
        <div className="flex items-center gap-3">
          <RatingStars value={product.rating} size={18} />
          <span className="text-slate-300">
            {product.rating?.toFixed(1) || '0.0'} от 5 ({product.numReviews} {product.numReviews === 1 ? 'отзив' : 'отзива'})
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        {user ? (
          <ReviewForm key={myReview?._id || 'new'} productId={product._id} myReview={myReview} onSaved={refresh} />
        ) : (
          <p className="text-slate-300">
            <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Влезте в профила си
            </Link>
            , за да оставите отзив.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-400">Все още няма отзиви. Бъдете първият!</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar user={review.user} />
                  <div>
                    <p className="font-semibold text-white">{getUserName(review.user)}</p>
                    <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.verifiedPurchase && (
                    <Badge tone="emerald">
                      <FaCheckCircle /> Потвърдена покупка
                    </Badge>
                  )}
                  {(isAdmin || review.user?._id === user?._id) && (
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label="Изтрий отзива"
                      loading={deleteMutation.isPending && deleteMutation.variables === review._id}
                      onClick={() => deleteMutation.mutate(review._id)}
                    >
                      {!(deleteMutation.isPending && deleteMutation.variables === review._id) && <FaTrash size={12} />}
                    </Button>
                  )}
                </div>
              </div>
              <RatingStars value={review.rating} className="mt-3" />
              {review.comment && <p className="mt-2 leading-7 text-slate-300">{review.comment}</p>}
            </article>
          ))}
          <Pagination page={page} pages={data?.pagination?.pages} onChange={setPage} />
        </div>
      )}
    </Panel>
  );
};
