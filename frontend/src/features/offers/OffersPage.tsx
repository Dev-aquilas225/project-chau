import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { apiFetch } from '@/lib/http';
import { formatPrice } from '@/lib/utils';
import { Tag, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  suggestedPrice: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    images: string[];
  };
  buyer?: {
    id: string;
    displayName: string;
  };
}

export function OffersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sentOffers, setSentOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const isSeller = user?.sellerStatus === 'approved';

  const loadOffers = async () => {
    setLoading(true);
    try {
      const sent = await apiFetch<Offer[]>('/offers/mine');
      setSentOffers(sent);

      if (isSeller) {
        const received = await apiFetch<Offer[]>('/offers/seller');
        setReceivedOffers(received);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeller]);

  const handleAccept = async (id: string) => {
    setSubmittingId(id);
    try {
      await apiFetch(`/offers/${id}/accept`, { method: 'PATCH' });
      toast.success('Offre acceptée avec succès !');
      await loadOffers();
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'accepter l\'offre.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setSubmittingId(id);
    try {
      await apiFetch(`/offers/${id}/decline`, { method: 'PATCH' });
      toast.info('Offre refusée.');
      await loadOffers();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de refuser l\'offre.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleBuy = (offer: Offer) => {
    // Add product to cart if it's not already there, and proceed to checkout with offerId
    // For Vinted, buying immediately with the discount:
    navigate(`/checkout?offerId=${offer.id}`);
  };

  const getStatusBadge = (status: Offer['status']) => {
    const badges = {
      pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="h-3.5 w-3.5" />, label: 'En attente' },
      accepted: { bg: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Acceptée' },
      declined: { bg: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Refusée' },
    };

    const b = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${b.bg}`}>
        {b.icon}
        {b.label}
      </span>
    );
  };

  return (
    <div className="container-app py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-ink text-paper rounded-2xl shadow-sm">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Négociations & Offres</h1>
            <p className="text-sm text-muted">Proposez et recevez des offres de prix sur les articles de luxe.</p>
          </div>
        </div>

        {/* Tab triggers */}
        {isSeller && (
          <div className="flex bg-gray-100 p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'sent' ? 'bg-paper text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Mes offres
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'received' ? 'bg-paper text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Offres reçues
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
      ) : activeTab === 'sent' ? (
        /* Sent Offers */
        sentOffers.length > 0 ? (
          <div className="space-y-4">
            {sentOffers.map((o) => (
              <div key={o.id} className="bg-paper border border-line rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition duration-150 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-line bg-gray-50">
                    <img 
                      src={o.product.images?.[0] ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/uploads/${o.product.images[0]}` : '/placeholder.jpg'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-ink truncate max-w-[250px]">{o.product.name}</h3>
                    <p className="text-xs text-muted font-medium mb-2">{o.product.brand || 'Sans marque'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted line-through">{formatPrice(o.product.price)}</span>
                      <ChevronRight className="h-3 w-3 text-muted" />
                      <span className="text-sm font-bold text-ink flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {formatPrice(o.suggestedPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-line/60">
                  {getStatusBadge(o.status)}

                  {o.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => handleBuy(o)}
                      className="btn-primary rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
                    >
                      Acheter au prix offre
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-3xl p-12 text-center shadow-sm">
            <Tag className="h-12 w-12 text-muted/40 mx-auto mb-3" />
            <h3 className="font-bold text-ink text-base">Aucune offre formulée</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">Vous n'avez soumis aucune offre de prix sur les articles du catalogue pour le moment.</p>
          </div>
        )
      ) : (
        /* Received Offers */
        receivedOffers.length > 0 ? (
          <div className="space-y-4">
            {receivedOffers.map((o) => (
              <div key={o.id} className="bg-paper border border-line rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition duration-150 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-line bg-gray-50">
                    <img 
                      src={o.product.images?.[0] ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/uploads/${o.product.images[0]}` : '/placeholder.jpg'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-ink truncate max-w-[250px]">{o.product.name}</h3>
                    <p className="text-xs text-muted mb-2">Offre de : <span className="font-bold text-ink">{o.buyer?.displayName}</span></p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted line-through">{formatPrice(o.product.price)}</span>
                      <ChevronRight className="h-3 w-3 text-muted" />
                      <span className="text-sm font-bold text-ink">{formatPrice(o.suggestedPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-line/60">
                  {o.status === 'pending' ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDecline(o.id)}
                        disabled={submittingId !== null}
                        className="btn-outline flex-1 sm:flex-none rounded-xl px-4 py-2 text-xs font-bold border-gray-200"
                      >
                        Refuser
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAccept(o.id)}
                        disabled={submittingId !== null}
                        className="btn-primary flex-1 sm:flex-none rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
                      >
                        Accepter
                      </button>
                    </div>
                  ) : (
                    getStatusBadge(o.status)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-3xl p-12 text-center shadow-sm">
            <Tag className="h-12 w-12 text-muted/40 mx-auto mb-3" />
            <h3 className="font-bold text-ink text-base">Aucune offre reçue</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">Vos acheteurs n'ont pas encore formulé d'offres sur vos annonces.</p>
          </div>
        )
      )}
    </div>
  );
}
