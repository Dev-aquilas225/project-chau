import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProductReviews, useCreateReview } from './hooks';
import { cn, formatDate } from '@/lib/utils';

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-line')} />
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
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
      toast.success('Avis publié, merci !');
    } catch {
      toast.error("Impossible d'enregistrer votre avis.");
    }
  };

  return (
    <section className="mt-12 border-t border-line pt-8" data-testid="product-reviews">
      <h2 className="text-lg font-semibold">Avis clients</h2>

      {!isLoading && data && (
        <div className="mt-2 flex items-center gap-2">
          <Stars value={data.average} size="h-5 w-5" />
          <span className="text-sm text-muted">
            {data.average.toFixed(1)} / 5 · {data.count} avis
          </span>
        </div>
      )}

      {user ? (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-lg border border-line p-4">
          <div>
            <label className="label">Votre note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                  onClick={() => setRating(n)}
                  data-testid={`rating-${n}`}
                >
                  <Star className={cn('h-6 w-6', n <= rating ? 'fill-amber-400 text-amber-400' : 'text-line')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea
              className="input min-h-20"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce produit…"
              data-testid="review-comment"
            />
          </div>
          <button className="btn-primary" disabled={createReview.isPending} data-testid="submit-review">
            {createReview.isPending ? 'Envoi…' : 'Publier mon avis'}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">Connectez-vous pour laisser un avis.</p>
      )}

      <ul className="mt-6 space-y-4">
        {isLoading && <p className="text-sm text-muted">Chargement des avis…</p>}
        {!isLoading && data?.items.length === 0 && <p className="text-sm text-muted">Aucun avis pour ce produit.</p>}
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
