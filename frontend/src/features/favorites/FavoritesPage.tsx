import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useProductsByIds } from '@/features/catalog/hooks';
import { ProductCard } from '@/components/ProductCard';
import { Spinner } from '@/components/ui/Spinner';

export function FavoritesPage() {
  const { t } = useTranslation('favorites');
  const ids = useFavoritesStore((s) => s.ids);
  const { data: products, isLoading } = useProductsByIds(ids);

  return (
    <div className="container-app py-6">
      <h1 className="mb-6 text-2xl">{t('title')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="py-16 text-center text-muted">
          <Heart className="mx-auto mb-3 h-10 w-10" />
          <p>{t('empty')}</p>
          <Link to="/catalogue" className="btn-outline mt-4">{t('browseCatalog')}</Link>
        </div>
      )}
    </div>
  );
}
