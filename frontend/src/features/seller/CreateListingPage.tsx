import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from './ListingForm';

export function CreateListingPage() {
  return (
    <div className="container-app py-8">
      <Link to="/espace-vendeur/annonces" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes annonces
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Nouvelle annonce</h1>
      <div className="max-w-2xl">
        <ListingForm />
      </div>
    </div>
  );
}
