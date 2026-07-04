import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProductReviews, useCreateReview } from './hooks';
import { cn, formatDate } from '@/lib/utils';

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  const { t } = useTranslation('reviews');
  return (
    <div className="flex items-center gap-0.5" aria-label={t('starsAriaLabel', { value })}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-line')} />
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { t } = useTranslation('reviews');
  const { user } = useAuth();
  const { data, isLoading } = useProductReviews(productId);
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview.mutateAsync({ rating, comment: comment.trim() || undefined });
      setComment('');
      toast.success(t('success'));
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <section className="mt-12 border-t border-line pt-8" data-testid="product-reviews">
      <h2 className="text-lg font-semibold">{t('title')}</h2>

      {!isLoading && data && (
        <div className="mt-2 flex items-center gap-2">
          <Stars value={data.average} size="h-5 w-5" />
          <span className="text-sm text-muted">
            {t('averageSummary', { average: data.average.toFixed(1), count: data.count })}
          </span>
        </div>
      )}

      {user ? (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-lg border border-line p-4">
          <div>
            <label className="label">{t('yourRating')}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={t('ratingAriaLabel', { count: n })}
                  onClick={() => setRating(n)}
                  data-testid={`rating-${n}`}
                >
                  <Star className={cn('h-6 w-6', n <= rating ? 'fill-amber-400 text-amber-400' : 'text-line')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">{t('comment')}</label>
            <textarea
              className="input min-h-20"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
              data-testid="review-comment"
            />
          </div>
          <button className="btn-primary" disabled={createReview.isPending} data-testid="submit-review">
            {createReview.isPending ? t('submitting') : t('submit')}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">{t('loginPrompt')}</p>
      )}

      <ul className="mt-6 space-y-4">
        {isLoading && <p className="text-sm text-muted">{t('loading')}</p>}
        {!isLoading && data?.items.length === 0 && <p className="text-sm text-muted">{t('empty')}</p>}
        {data?.items.map((r) => (
          <li key={r.id} className="border-b border-line pb-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.userName}</span>
              <span className="text-xs text-muted">{formatDate(new Date(r.createdAt))}</span>
            </div>
            <Stars value={r.rating} />
            {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
