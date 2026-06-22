import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMyListings, useDeleteListing } from './hooks';
import { formatPrice, cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  active: 'Actif',
  draft: 'Brouillon',
  archived: 'Archivé',
};

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-600',
};

export function MyListingsPage() {
  const { data: listings = [], isLoading } = useMyListings();
  const del = useDeleteListing();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Archiver "${name}" ?`)) return;
    try {
      await del.mutateAsync(id);
      toast.success('Article archivé');
    } catch {
      toast.error('Impossible d\'archiver l\'article');
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes annonces</h1>
        <Link to="/espace-vendeur/annonces/creer" className="btn-primary flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Nouvelle annonce
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted">Chargement…</p>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Vous n'avez pas encore d'annonces.</p>
          <Link to="/espace-vendeur/annonces/creer" className="btn-primary mt-4 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Créer ma première annonce
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
                    {STATUS_LABEL[listing.listingStatus ?? 'active']}
                  </span>
                </div>
                <p className="text-xs text-muted">Stock : {listing.stock}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/espace-vendeur/annonces/${listing.id}/modifier`}
                    className="btn-outline flex flex-1 items-center justify-center gap-1 py-1.5 text-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Modifier
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
