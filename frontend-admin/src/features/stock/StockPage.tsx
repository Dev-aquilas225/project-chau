import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminProducts, useUpdateProduct } from '@/features/products/hooks';
import { cn } from '@/lib/utils';

const LOW_THRESHOLD = 2;

export function StockPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const update = useUpdateProduct();
  const [edits, setEdits] = useState<Record<string, number>>({});

  const sorted = [...products].sort((a, b) => a.stock - b.stock);
  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_THRESHOLD);

  const save = async (id: string) => {
    const stock = edits[id];
    if (stock == null || stock < 0) return;
    try {
      await update.mutateAsync({ id, input: { stock } });
      toast.success('Stock mis à jour');
      setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
    } catch { toast.error('Mise à jour impossible'); }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl">Gestion du stock</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-3 border-red-200 bg-red-50">
          <AlertTriangle className="h-6 w-6 text-sale" />
          <div><p className="text-2xl font-semibold text-sale">{outOfStock.length}</p><p className="text-sm text-muted">En rupture</p></div>
        </div>
        <div className="card flex items-center gap-3 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          <div><p className="text-2xl font-semibold text-amber-700">{lowStock.length}</p><p className="text-sm text-muted">Stock faible (≤ {LOW_THRESHOLD})</p></div>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead className="border-b border-line bg-gray-50">
            <tr><th className="th">Produit</th><th className="th">Stock actuel</th><th className="th">Ajuster</th><th className="th"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? <tr><td className="td" colSpan={4}>Chargement…</td></tr> : sorted.map((p) => (
              <tr key={p.id} className={cn(p.stock === 0 && 'bg-red-50/40')}>
                <td className="td"><p className="font-medium uppercase">{p.brand}</p><p className="text-xs text-muted">{p.name}</p></td>
                <td className="td">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold',
                    p.stock === 0 ? 'bg-red-100 text-sale' : p.stock <= LOW_THRESHOLD ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-800')}>
                    {p.stock === 0 ? 'Rupture' : `${p.stock} en stock`}
                  </span>
                </td>
                <td className="td">
                  <input
                    type="number" min={0}
                    className="input w-24"
                    defaultValue={p.stock}
                    onChange={(e) => setEdits((s) => ({ ...s, [p.id]: Number(e.target.value) }))}
                  />
                </td>
                <td className="td">
                  <button
                    className="btn-outline px-3 py-1.5 text-xs"
                    disabled={edits[p.id] == null || edits[p.id] === p.stock}
                    onClick={() => save(p.id)}
                  >
                    <Check className="h-3 w-3" /> Enregistrer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
