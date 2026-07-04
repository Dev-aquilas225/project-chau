import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useCreateListing, useUpdateListing } from './hooks';
import { uploadListingImage } from './api';
import { useCategories } from '@/features/catalog/hooks';
import type { Product } from '@/types';

function getListingSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t('seller:listing.errors.nameRequired')),
    brand: z.string().min(1, t('seller:listing.errors.brandRequired')),
    description: z.string().max(5000).optional().default(''),
    price: z.coerce.number().positive(t('seller:listing.errors.priceInvalid')),
    categoryId: z.string().optional(),
    stock: z.coerce.number().int().nonnegative(t('seller:listing.errors.stockInvalid')).default(1),
    condition: z.string().optional().default(''),
    size: z.string().optional().default(''),
    location: z.string().optional().default(''),
  });
}

type FormValues = z.input<ReturnType<typeof getListingSchema>>;

export function ListingForm({ listing }: { listing?: Product }) {
  const { t } = useTranslation('seller');
  const schema = useMemo(() => getListingSchema(t), [t]);
  const navigate = useNavigate();
  const create = useCreateListing();
  const update = useUpdateListing();
  const { data: categories = [] } = useCategories();
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: listing?.name ?? '',
      brand: listing?.brand ?? '',
      description: listing?.description ?? '',
      price: listing?.price ?? 0,
      categoryId: listing?.category ?? '',
      stock: listing?.stock ?? 1,
      condition: listing?.condition ?? '',
      size: listing?.size ?? '',
      location: listing?.location ?? '',
    },
  });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(Array.from(files).map(uploadListingImage));
      setImages((prev) => [...prev, ...results.map((r) => r.url)]);
    } catch {
      toast.error(t('listing.errors.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name as string,
      brand: values.brand as string,
      description: values.description as string | undefined,
      price: values.price as number,
      stock: values.stock as number,
      condition: values.condition as string | undefined,
      size: values.size as string | undefined,
      location: values.location as string | undefined,
      categoryId: (values.categoryId as string) || undefined,
      images,
    };
    try {
      if (listing) {
        await update.mutateAsync({ id: listing.id, input: payload });
        toast.success(t('listing.updateSuccess'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('listing.createSuccess'));
      }
      navigate('/espace-vendeur/annonces');
    } catch {
      toast.error(t('listing.errors.saveFailed'));
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Images */}
      <div>
        <label className="label">{t('listing.form.photosLabel')}</label>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="group relative h-24 w-20 overflow-hidden rounded border border-line">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-0.5 top-0.5 rounded-full bg-white/80 p-0.5 opacity-0 group-hover:opacity-100"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-line hover:bg-gray-50">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : <Upload className="h-5 w-5 text-muted" />}
            <span className="mt-1 text-xs text-muted">{t('listing.form.uploadLabel')}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t('listing.form.brandLabel')}</label>
          <input className="input" {...register('brand')} />
          {errors.brand && <p className="error">{errors.brand.message}</p>}
        </div>
        <div>
          <label className="label">{t('listing.form.nameLabel')}</label>
          <input className="input" {...register('name')} />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">{t('listing.form.descriptionLabel')}</label>
        <textarea className="input" rows={4} {...register('description')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">{t('listing.form.priceLabel')}</label>
          <input className="input" type="number" step="0.01" min="0" {...register('price')} />
          {errors.price && <p className="error">{errors.price.message}</p>}
        </div>
        <div>
          <label className="label">{t('listing.form.stockLabel')}</label>
          <input className="input" type="number" min="0" {...register('stock')} />
        </div>
        <div>
          <label className="label">{t('listing.form.categoryLabel')}</label>
          <select className="input" {...register('categoryId')}>
            <option value="">{t('listing.form.categoryPlaceholder')}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">{t('listing.form.conditionLabel')}</label>
          <input className="input" placeholder={t('listing.form.conditionPlaceholder')} {...register('condition')} />
        </div>
        <div>
          <label className="label">{t('listing.form.sizeLabel')}</label>
          <input className="input" placeholder={t('listing.form.sizePlaceholder')} {...register('size')} />
        </div>
        <div>
          <label className="label">{t('listing.form.locationLabel')}</label>
          <input className="input" placeholder={t('listing.form.locationPlaceholder')} {...register('location')} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? t('listing.form.saving') : listing ? t('listing.form.update') : t('listing.form.publish')}
        </button>
        <button type="button" className="btn-outline" onClick={() => navigate('/espace-vendeur/annonces')}>
          {t('listing.form.cancel')}
        </button>
      </div>
    </form>
  );
}
