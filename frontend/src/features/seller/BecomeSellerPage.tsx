import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Store, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthProvider';
import { useApplyAsSeller } from './hooks';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function BecomeSellerPage() {
  const { loading, user, sellerStatus, refresh } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const apply = useApplyAsSeller();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login?redirect=/devenir-vendeur" replace />;
  if (sellerStatus === 'approved') return <Navigate to="/espace-vendeur" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) { toast.error('Nom de boutique requis'); return; }
    try {
      await apply.mutateAsync({ storeName: storeName.trim(), bio: bio.trim() || undefined });
      await refresh();
      toast.success('Candidature envoyée !');
    } catch {
      toast.error('Impossible de soumettre la candidature');
    }
  };

  if (sellerStatus === 'pending') {
    return (
      <div className="container-app py-16 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="mb-2 text-2xl font-bold">Candidature en attente</h1>
        <p className="text-muted">Votre demande est en cours d'examen. Vous serez notifié une fois approuvé.</p>
        <Link to="/" className="mt-6 inline-block text-sm underline">Retour à l'accueil</Link>
      </div>
    );
  }

  if (sellerStatus === 'rejected') {
    return (
      <div className="container-app py-16 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-sale" />
        <h1 className="mb-2 text-2xl font-bold">Candidature refusée</h1>
        <p className="text-muted">Votre candidature n'a pas été acceptée. Contactez le support pour plus d'informations.</p>
        <Link to="/" className="mt-6 inline-block text-sm underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <Store className="mx-auto mb-4 h-12 w-12" />
          <h1 className="text-3xl font-bold">Devenez vendeur</h1>
          <p className="mt-2 text-muted">Rejoignez notre marketplace et proposez vos pièces de luxe à notre communauté.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nom de votre boutique *</label>
            <input
              className="input"
              placeholder="Ex : Élégance Parisienne"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="label">Présentation (optionnel)</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Décrivez votre boutique, votre spécialité…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="rounded-lg border border-line bg-gray-50 p-4 text-sm text-muted">
            <p className="flex items-center gap-2 font-medium text-ink"><CheckCircle className="h-4 w-4 text-green-600" /> Ce que vous obtenez</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Mise en vente illimitée d'articles</li>
              <li>Paiement sécurisé par escrow</li>
              <li>Tableau de bord vendeur dédié</li>
            </ul>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={apply.isPending}>
            {apply.isPending ? 'Envoi…' : 'Soumettre ma candidature'}
          </button>
        </form>
      </div>
    </div>
  );
}
