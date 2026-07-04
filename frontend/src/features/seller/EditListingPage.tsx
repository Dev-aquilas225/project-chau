import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ListingForm } from './ListingForm';
import { getMyListings } from './api';

export function EditListingPage() {
  const { t } = useTranslation('seller');
  const { id } = useParams<{ id: string }>();
  const { data: listings, isLoading } = useQuery({ queryKey: ['my-listings'], queryFn: getMyListings });
  const listing = listings?.find((l) => l.id === id);

  if (isLoading) return <p className="container-app py-8 text-muted">{t('editListing.loading')}</p>;
  if (!listing) return <p className="container-app py-8 text-sale">{t('editListing.notFound')}</p>;

  return (
    <div className="container-app py-8">
      <Link to="/espace-vendeur/annonces" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {t('editListing.backToListings')}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{t('editListing.title')}</h1>
      <div className="max-w-2xl">
        <ListingForm listing={listing} />
      </div>
    </div>
  );
}
