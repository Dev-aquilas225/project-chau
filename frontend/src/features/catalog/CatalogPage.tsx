import { Fragment, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProducts, useCategories } from './hooks';
import type { ProductFilters } from './api';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';
import { Spinner } from '@/components/ui/Spinner';

const PAGE_SIZE = 10;

export function CatalogPage() {
  const { t } = useTranslation('catalog');
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

  const totalPages = Math.max(1, Math.ceil((products?.length ?? 0) / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), totalPages);
  const paginatedProducts = products?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage > 1) next.set('page', String(nextPage));
    else next.delete('page');
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-app py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">
          {filters.search ? t('catalog.title.results', { search: filters.search }) : filters.category
            ? categories?.find((c) => c.id === filters.category)?.name ?? t('catalog.title.default')
            : t('catalog.title.default')}
        </h1>
        <span className="flex items-center gap-1 text-sm text-muted">
          <SlidersHorizontal className="h-4 w-4" /> {t('catalog.itemsCount', { count: products?.length ?? 0 })}
        </span>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select className="input max-w-[180px]" value={filters.category ?? ''} onChange={(e) => update('category', e.target.value)} data-testid="filter-category">
          <option value="">{t('catalog.filters.allCategories')}</option>
          {categories?.filter((c) => !c.parentId).map((top) => (
            <optgroup key={top.id} label={top.name}>
              <option value={top.id}>{top.name}</option>
              {categories.filter((sub) => sub.parentId === top.id).map((sub) => (
                <Fragment key={sub.id}>
                  <option value={sub.id}>{'  '}{sub.name}</option>
                  {categories.filter((type) => type.parentId === sub.id).map((type) => (
                    <option key={type.id} value={type.id}>{'    '}{type.name}</option>
                  ))}
                </Fragment>
              ))}
            </optgroup>
          ))}
        </select>
        <input className="input max-w-[120px]" type="number" placeholder={t('catalog.filters.minPricePlaceholder')} defaultValue={params.get('min') ?? ''} onBlur={(e) => update('min', e.target.value)} data-testid="filter-min" />
        <input className="input max-w-[120px]" type="number" placeholder={t('catalog.filters.maxPricePlaceholder')} defaultValue={params.get('max') ?? ''} onBlur={(e) => update('max', e.target.value)} data-testid="filter-max" />
        <select className="input max-w-[180px]" value={filters.sort} onChange={(e) => update('sort', e.target.value)} data-testid="filter-sort">
          <option value="recent">{t('catalog.sort.recent')}</option>
          <option value="price-asc">{t('catalog.sort.priceAsc')}</option>
          <option value="price-desc">{t('catalog.sort.priceDesc')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : isError ? (
        <p role="alert" className="py-16 text-center text-sale">{t('catalog.error')}</p>
      ) : products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {paginatedProducts?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </>
      ) : (
        <div className="py-16 text-center text-muted">
          <p>{t('catalog.empty')}</p>
        </div>
      )}
    </div>
  );
}
