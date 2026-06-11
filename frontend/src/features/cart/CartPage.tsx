import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center text-muted">
        <ShoppingBag className="mx-auto mb-3 h-10 w-10" />
        <p>Votre panier est vide.</p>
        <Link to="/catalogue" className="btn-outline mt-4">Continuer mes achats</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <h1 className="mb-6 text-2xl">Mon panier</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <ul className="divide-y divide-line lg:col-span-2">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-4 py-4" data-testid="cart-item">
              <Link to={`/produit/${i.productId}`} className="h-28 w-20 shrink-0 overflow-hidden bg-gray-100">
                {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-bold uppercase">{i.brand}</p>
                <p className="text-sm text-muted">{i.name}{i.size ? ` · ${i.size}` : ''}</p>
                <p className="mt-1 text-sm font-semibold">{formatPrice(i.unitPrice)}</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center border border-line">
                    <button className="px-2 py-1" onClick={() => updateQty(i.productId, i.qty - 1)} aria-label="Moins"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-sm">{i.qty}</span>
                    <button className="px-2 py-1" onClick={() => updateQty(i.productId, i.qty + 1)} aria-label="Plus"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeItem(i.productId)} aria-label="Supprimer" className="text-muted hover:text-sale">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-line p-5">
          <div className="flex justify-between text-sm"><span>Sous-total</span><span>{formatPrice(subtotal())}</span></div>
          <div className="mt-2 flex justify-between text-sm text-muted"><span>Livraison</span><span>Calculée à l'étape suivante</span></div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold"><span>Total</span><span>{formatPrice(subtotal())}</span></div>
          <button className="btn-primary mt-5 w-full" onClick={() => navigate('/checkout')} data-testid="go-checkout">
            Passer la commande
          </button>
        </aside>
      </div>
    </div>
  );
}
