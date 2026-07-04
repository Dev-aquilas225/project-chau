import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Leaf, ShieldCheck, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useProduct } from './hooks';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { ProductReviews } from '@/features/reviews/ProductReviews';

export function ProductDetailPage() {
  const { t } = useTranslation('catalog');
  const { id = '' } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const isFav = useFavoritesStore((s) => s.ids.includes(id));
  const toggle = useFavoritesStore((s) => s.toggle);
  const [active, setActive] = useState(0);

  if (isLoading) return <FullPageSpinner />;
  if (isError || !product) return <p className="py-16 text-center text-sale">{t('productDetail.notFound')}</p>;

  const soldOut = product.stock === 0;

  return (
    <div className="container-app py-6">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Galerie */}
        <div>
          <div className="aspect-[3/4] overflow-hidden bg-gray-100">
            {product.images[active] && (
              <img src={product.images[active]} alt={`${product.brand} ${product.name}`} className="h-full w-full object-cover" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={cn('h-20 w-16 overflow-hidden border', i === active ? 'border-ink' : 'border-line')}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          {product.weLove && <span className="badge mb-2">WE LOVE</span>}
          <h1 className="text-2xl font-bold uppercase tracking-tight">{product.brand}</h1>
          <p className="text-lg text-muted">{product.name}</p>
          <p className="mt-3 text-2xl font-semibold">{formatPrice(product.price)}</p>

          <dl className="mt-5 space-y-1 text-sm">
            {product.size && <div className="flex gap-2"><dt className="text-muted">{t('productDetail.size')}</dt><dd>{product.size}</dd></div>}
            {product.condition && <div className="flex gap-2"><dt className="text-muted">{t('productDetail.condition')}</dt><dd>{product.condition}</dd></div>}
            {product.location && (
              <div className="flex items-center gap-2"><dt className="text-muted">{t('productDetail.origin')}</dt>
                <dd className="flex items-center gap-1"><Leaf className="h-3.5 w-3.5" />{product.location}</dd></div>
            )}
          </dl>

          <div className="mt-6 flex gap-3">
            <button
              className="btn-primary flex-1"
              disabled={soldOut}
              data-testid="add-to-cart"
              onClick={() => { addItem(product); toast.success(t('productDetail.addedToCart')); }}
            >
              {soldOut ? t('productDetail.soldOut') : t('productDetail.addToCart')}
            </button>
            <button
              onClick={() => toggle(product.id)}
              aria-label={t('productDetail.favoriteAriaLabel')}
              aria-pressed={isFav}
              className="btn-outline px-4"
            >
              <Heart className={cn('h-5 w-5', isFav && 'fill-sale text-sale')} />
            </button>
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>

          {/* Authenticité (inspiré de la capture) */}
          <div className="mt-8 rounded-lg border border-line p-4">
            <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5" /> {t('productDetail.authenticity.title')}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t('productDetail.authenticity.text')}
            </p>
          </div>

          {/* Carte vendeur */}
          {product.seller && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-line p-4">
              <Store className="h-5 w-5 shrink-0 text-muted" />
              <div>
                <p className="font-medium">{product.seller.sellerProfile?.storeName ?? product.seller.displayName}</p>
                <Link
                  to={`/catalogue?sellerId=${product.seller.id}`}
                  className="text-xs text-muted underline"
                >
                  {t('productDetail.seller.viewAllListings')}
                </Link>
              </div>
            </div>
          )}

          <Link to="/catalogue" className="mt-6 inline-block text-sm underline">{t('productDetail.backToCatalog')}</Link>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
