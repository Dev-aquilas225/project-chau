import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { useProducts, useCategories } from './hooks';
import type { ProductFilters } from './api';
import { ProductCard } from '@/components/ProductCard';
import { Spinner } from '@/components/ui/Spinner';

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const { data: categories } = useCategories();

  const filters: ProductFilters = useMemo(() => ({
    category: params.get('category') || undefined,
    search: params.get('search') || undefined,
    minPrice: params.get('min') ? Number(params.get('min')) : undefined,
    maxPrice: params.get('max') ? Number(params.get('max')) : undefined,
    sort: (params.get('sort') as ProductFilters['sort']) || 'recent',
  }), [params]);

  const { data: products, isLoading, isError } = useProducts(filters);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="container-app py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">
          {filters.search ? `Résultats : « ${filters.search} »` : filters.category
            ? categories?.find((c) => c.id === filters.category)?.name ?? 'Catalogue'
            : 'Catalogue'}
        </h1>
        <span className="flex items-center gap-1 text-sm text-muted">
          <SlidersHorizontal className="h-4 w-4" /> {products?.length ?? 0} articles
        </span>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select className="input max-w-[180px]" value={filters.category ?? ''} onChange={(e) => update('category', e.target.value)} data-testid="filter-category">
          <option value="">Toutes catégories</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="input max-w-[120px]" type="number" placeholder="Prix min" defaultValue={params.get('min') ?? ''} onBlur={(e) => update('min', e.target.value)} data-testid="filter-min" />
        <input className="input max-w-[120px]" type="number" placeholder="Prix max" defaultValue={params.get('max') ?? ''} onBlur={(e) => update('max', e.target.value)} data-testid="filter-max" />
        <select className="input max-w-[180px]" value={filters.sort} onChange={(e) => update('sort', e.target.value)} data-testid="filter-sort">
          <option value="recent">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : isError ? (
        <p role="alert" className="py-16 text-center text-sale">Impossible de charger les produits.</p>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="py-16 text-center text-muted">
          <p>Aucun article ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
