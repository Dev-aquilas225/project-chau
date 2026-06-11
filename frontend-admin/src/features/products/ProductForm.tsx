import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { uploadProductImage } from './api';
import { useCreateProduct, useUpdateProduct, useAdminCategories } from './hooks';

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  brand: z.string().min(1, 'Marque requise'),
  description: z.string().max(5000).optional().default(''),
  price: z.coerce.number().nonnegative('Prix invalide'),
  category: z.string().min(1, 'Catégorie requise'),
  stock: z.coerce.number().int().nonnegative('Stock invalide'),
  size: z.string().optional().default(''),
  condition: z.string().optional().default(''),
  location: z.string().optional().default(''),
  active: z.boolean().default(true),
  weLove: z.boolean().default(false),
});
type FormValues = z.input<typeof schema>;

export function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const isEdit = !!product;
  const { data: categories } = useAdminCategories();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '', brand: product?.brand ?? '', description: product?.description ?? '',
      price: product?.price ?? 0, category: product?.category ?? '', stock: product?.stock ?? 0,
      size: product?.size ?? '', condition: product?.condition ?? '', location: product?.location ?? '',
      active: product?.active ?? true, weLove: product?.weLove ?? false,
    },
  });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Échec de l'upload (vérifiez vos droits admin / Storage).");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const payload = { ...schema.parse(values), images };
    try {
      if (isEdit) await update.mutateAsync({ id: product!.id, input: payload });
      else await create.mutateAsync(payload);
      toast.success(isEdit ? 'Produit mis à jour' : 'Produit créé');
      onClose();
    } catch {
      toast.error("Enregistrement impossible (droits admin requis).");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-lg bg-paper p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose} aria-label="Fermer"><X /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Marque</label><input className="input" {...register('brand')} />{errors.brand && <p className="text-xs text-sale">{errors.brand.message}</p>}</div>
            <div><label className="label">Nom</label><input className="input" {...register('name')} />{errors.name && <p className="text-xs text-sale">{errors.name.message}</p>}</div>
            <div><label className="label">Prix ($)</label><input className="input" type="number" step="1" {...register('price')} />{errors.price && <p className="text-xs text-sale">{errors.price.message}</p>}</div>
            <div><label className="label">Stock</label><input className="input" type="number" {...register('stock')} />{errors.stock && <p className="text-xs text-sale">{errors.stock.message}</p>}</div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" {...register('category')}>
                <option value="">—</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-xs text-sale">{errors.category.message}</p>}
            </div>
            <div><label className="label">Taille</label><input className="input" {...register('size')} /></div>
            <div><label className="label">État</label><input className="input" placeholder="Très bon état…" {...register('condition')} /></div>
            <div><label className="label">Origine</label><input className="input" placeholder="France…" {...register('location')} /></div>
          </div>

          <div><label className="label">Description</label><textarea className="input min-h-20" {...register('description')} /></div>

          {/* Images */}
          <div>
            <label className="label">Images</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative h-20 w-16 overflow-hidden rounded border border-line">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-0 top-0 bg-black/60 p-0.5 text-white"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <label className="btn-outline cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Ajouter des images
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('active')} /> Actif (visible boutique)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('weLove')} /> Coup de cœur</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={onClose}>Annuler</button>
            <button className="btn-primary" disabled={create.isPending || update.isPending || uploading} data-testid="save-product">
              {create.isPending || update.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
