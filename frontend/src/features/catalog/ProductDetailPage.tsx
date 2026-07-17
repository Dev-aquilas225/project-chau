import { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Leaf, ShieldCheck, Store, X, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useProduct } from './hooks';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProductReviews } from '@/features/reviews/ProductReviews';

export function ProductDetailPage() {
  const { t } = useTranslation('catalog');
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product, isLoading, isError } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const isFav = useFavoritesStore((s) => s.ids.includes(id));
  const toggle = useFavoritesStore((s) => s.toggle);
  const [active, setActive] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  
  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Veuillez entrer un prix valide.');
      return;
    }

    setSubmittingOffer(true);
    try {
      await apiFetch('/offers', {
        method: 'POST',
        body: { productId: product.id, suggestedPrice: price },
      });
      toast.success('Votre offre a bien été envoyée au vendeur !');
      setShowOfferModal(false);
      setOfferPrice('');
      navigate('/offres');
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'envoyer l\'offre.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    toggle(id);
  };

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
              onClick={handleToggleFavorite}
              aria-label={t('productDetail.favoriteAriaLabel')}
              aria-pressed={isFav}
              className="btn-outline px-4"
            >
              <Heart className={cn('h-5 w-5', isFav && 'fill-sale text-sale')} />
            </button>
          </div>

          {!soldOut && user?.id !== product.sellerId && (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
                  return;
                }
                setShowOfferModal(true);
              }}
              className="btn-outline w-full rounded-xl font-bold py-3 mt-3 border-gray-200 transition"
            >
              Faire une offre
            </button>
          )}

          {/* Offer Modal Overlay */}
          {showOfferModal && (
            <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-paper p-6 rounded-2xl border border-line shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-ink text-base">Faire une offre de prix</h3>
                  <button type="button" onClick={() => setShowOfferModal(false)} className="text-muted hover:text-ink">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleMakeOffer} className="space-y-4">
                  <div className="text-left">
                    <p className="text-xs text-muted leading-relaxed mb-3">
                      Proposez un prix d'achat au vendeur pour "{product.name}". Prix initial : <span className="font-bold text-ink">{formatPrice(product.price)}</span>.
                    </p>
                    <label className="label text-xs font-semibold mb-1">Votre offre (EUR)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="input rounded-xl pr-10 py-2.5 font-semibold text-sm"
                        placeholder="Ex: 80"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted text-xs">EUR</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="btn-outline flex-1 rounded-xl py-2 text-xs font-semibold border-gray-200"
                      onClick={() => setShowOfferModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOffer}
                      className="btn-primary flex-1 rounded-xl py-2 text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                    >
                      {submittingOffer ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Envoyer l\'offre'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
