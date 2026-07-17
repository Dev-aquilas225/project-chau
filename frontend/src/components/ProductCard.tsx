import { memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="group relative card-hover transition-luxury" data-testid="product-card">
      <Link to={`/produit/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-luxury-beige mb-4">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={`${product.brand} ${product.name}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-luxury-muted text-xs uppercase tracking-wider">
              {t('productCard.noImage')}
            </div>
          )}

          {/* Badges */}
          {product.weLove && (
            <span className="badge absolute left-4 top-4">We Love</span>
          )}
          {product.condition && !product.weLove && (
            <span className="badge absolute left-4 top-4">{product.condition}</span>
          )}
          {product.stock === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-luxury-dark/80 py-1.5 text-center text-[11px] font-medium text-white uppercase tracking-widest">
              {t('productCard.sold')}
            </span>
          )}

          {/* Favorite button — appears on hover */}
          <button
            onClick={handleToggleFavorite}
            aria-label={isFav ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
            aria-pressed={isFav}
            data-testid="fav-toggle"
            className={cn(
              'absolute bottom-4 right-4 rounded-full bg-white/90 p-3 shadow-sm',
              'opacity-0 group-hover:opacity-100 transition-luxury'
            )}
          >
            <Heart
              className={cn('h-4 w-4', isFav ? 'fill-sale text-sale' : 'text-luxury-dark')}
            />
          </button>
        </div>

        {/* Product info */}
        <div>
          <p className="text-sm font-bold uppercase tracking-tight mb-1 text-luxury-dark">
            {product.brand}
          </p>
          <p className="text-sm text-luxury-muted truncate mb-2">{product.name}</p>
          {product.size && (
            <p className="text-xs text-luxury-muted mb-1">{product.size}</p>
          )}
          <p className="text-sm font-medium text-luxury-dark">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </div>
  );
});
