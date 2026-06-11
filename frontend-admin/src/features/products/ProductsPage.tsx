import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminProducts, useDeleteProduct } from './hooks';
import { ProductForm } from './ProductForm';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductsPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const del = useDeleteProduct();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (p: Product) => {
    if (!confirm(`Supprimer « ${p.brand} ${p.name} » ?`)) return;
    try { await del.mutateAsync(p.id); toast.success('Produit supprimé'); }
    catch { toast.error('Suppression impossible'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Produits</h1>
        <button className="btn-primary" onClick={() => setCreating(true)} data-testid="new-product"><Plus className="h-4 w-4" /> Nouveau produit</button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b border-line bg-gray-50">
            <tr><th className="th">Produit</th><th className="th">Catégorie</th><th className="th">Prix</th><th className="th">Stock</th><th className="th">Statut</th><th className="th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <tr><td className="td text-muted" colSpan={6}>Chargement…</td></tr>
            ) : products.length === 0 ? (
              <tr><td className="td text-muted" colSpan={6}>Aucun produit. Cliquez sur « Nouveau produit ».</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                      {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div><p className="font-medium uppercase">{p.brand}</p><p className="text-xs text-muted">{p.name}</p></div>
                  </div>
                </td>
                <td className="td text-muted">{p.category}</td>
                <td className="td font-medium">{formatPrice(p.price)}</td>
                <td className="td"><span className={cn(p.stock === 0 ? 'text-sale font-semibold' : p.stock <= 2 ? 'text-amber-600 font-semibold' : '')}>{p.stock}</span></td>
                <td className="td">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs', p.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-muted')}>
                    {p.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(p)} className="rounded p-1.5 hover:bg-gray-100" aria-label="Modifier"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p)} className="rounded p-1.5 text-sale hover:bg-red-50" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && <ProductForm onClose={() => setCreating(false)} />}
      {editing && <ProductForm product={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
