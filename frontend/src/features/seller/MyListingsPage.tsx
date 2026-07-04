import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useMyListings, useDeleteListing } from './hooks';
import { formatPrice, cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-600',
};

export function MyListingsPage() {
  const { t } = useTranslation('seller');
  const { data: listings = [], isLoading } = useMyListings();
  const del = useDeleteListing();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('myListings.archiveConfirm', { name }))) return;
    try {
      await del.mutateAsync(id);
      toast.success(t('myListings.archiveSuccess'));
    } catch {
      toast.error(t('myListings.archiveFailed'));
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('myListings.title')}</h1>
        <Link to="/espace-vendeur/annonces/creer" className="btn-primary flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> {t('myListings.newListing')}
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted">{t('myListings.loading')}</p>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">{t('myListings.empty')}</p>
          <Link to="/espace-vendeur/annonces/creer" className="btn-primary mt-4 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> {t('myListings.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="card overflow-hidden p-0">
              {listing.images[0] ? (
                <img src={listing.images[0]} alt={listing.name} className="aspect-[3/2] w-full object-cover" />
              ) : (
                <div className="aspect-[3/2] w-full bg-gray-100" />
              )}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{listing.brand} {listing.name}</p>
                    <p className="text-sm font-medium">{formatPrice(listing.price)}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLOR[listing.listingStatus ?? 'active'])}>
                    {t(`myListings.listingStatus.${listing.listingStatus ?? 'active'}`)}
                  </span>
                </div>
                <p className="text-xs text-muted">{t('myListings.stockLabel')} {listing.stock}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/espace-vendeur/annonces/${listing.id}/modifier`}
                    className="btn-outline flex flex-1 items-center justify-center gap-1 py-1.5 text-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" /> {t('myListings.edit')}
                  </Link>
                  <button
                    className="btn-outline flex items-center gap-1 px-3 py-1.5 text-sm text-sale"
                    onClick={() => handleDelete(listing.id, listing.name)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
