import { memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuth } from '@/features/auth/AuthProvider';

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isFav = useFavoritesStore((s) => s.ids.includes(product.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  const handleToggleFavorite = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="group relative" data-testid="product-card">
      <Link to={`/produit/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={`${product.brand} ${product.name}`}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">{t('productCard.noImage')}</div>
          )}
          {product.weLove && <span className="badge absolute left-2 top-2 bg-white/90">WE LOVE</span>}
          {product.stock === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-xs font-medium text-paper">
              {t('productCard.sold')}
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={handleToggleFavorite}
        aria-label={isFav ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
        aria-pressed={isFav}
        data-testid="fav-toggle"
        className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur"
      >
        <Heart className={cn('h-5 w-5', isFav ? 'fill-sale text-sale' : 'text-ink')} />
      </button>

      <div className="pt-2">
        <Link to={`/produit/${product.id}`}>
          <p className="truncate text-sm font-bold uppercase tracking-tight">{product.brand}</p>
          <p className="truncate text-sm text-muted">{product.name}</p>
          {product.size && <p className="text-sm text-muted">{product.size}</p>}
          <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
          {product.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Leaf className="h-3.5 w-3.5" /> {product.location}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
});
