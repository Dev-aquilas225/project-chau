import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { productSchema, type ProductFormValues } from './schemas';
import { useProduct, useCreateProduct, useUpdateProduct } from './hooks';
import { useCategories } from '@/features/categories/hooks';
import { flattenCategoryTree } from '@/features/categories/utils';
import ImageUploader from './components/ImageUploader';

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  brand: '',
  description: '',
  price: 0,
  categoryId: '',
  stock: 0,
  condition: '',
  size: '',
  location: '',
  active: true,
  weLove: false,
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { data: categories = [] } = useCategories();
  const categoryTree = flattenCategoryTree(categories);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId ?? '',
        stock: product.stock,
        condition: product.condition ?? '',
        size: product.size ?? '',
        location: product.location ?? '',
        active: product.active,
        weLove: product.weLove,
      });
      setImages(product.images ?? []);
    }
  }, [product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    const input = { ...values, categoryId: values.categoryId || undefined, images };
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, input });
    } else {
      await createMutation.mutateAsync(input);
    }
    navigate('/produits');
  };

  if (isEdit && isLoadingProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/produits')} sx={{ color: 'text.secondary' }}>
          Retour
        </Button>
      </Stack>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack spacing={2.5}>
                  <TextField
                    label="Nom"
                    fullWidth
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField label="Marque" fullWidth {...register('brand')} />
                    <TextField
                      label="Catégorie"
                      select
                      fullWidth
                      defaultValue={product?.categoryId ?? ''}
                      {...register('categoryId')}
                    >
                      <MenuItem value="">Aucune</MenuItem>
                      {categoryTree.map((c) => (
                        <MenuItem
                          key={c.id}
                          value={c.id}
                          sx={{ pl: 2 + c.depth * 2, fontWeight: c.depth === 0 ? 700 : 400 }}
                        >
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                  <TextField label="Description" fullWidth multiline minRows={4} {...register('description')} />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Prix (€)"
                      type="number"
                      fullWidth
                      inputProps={{ step: '0.01', min: 0 }}
                      {...register('price')}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                    <TextField
                      label="Stock"
                      type="number"
                      fullWidth
                      inputProps={{ min: 0 }}
                      {...register('stock')}
                      error={!!errors.stock}
                      helperText={errors.stock?.message}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField label="État" fullWidth {...register('condition')} placeholder="Neuf, Très bon état…" />
                    <TextField label="Taille" fullWidth {...register('size')} />
                    <TextField label="Localisation" fullWidth {...register('location')} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Visibilité
                  </Typography>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                        label="Actif (visible en boutique)"
                      />
                    )}
                  />
                  <Controller
                    name="weLove"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                        label="Coup de cœur"
                      />
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Images
                  </Typography>
                  <ImageUploader images={images} onChange={setImages} />
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isEdit ? 'Enregistrer' : 'Créer le produit'}
          </Button>
          <Button size="large" onClick={() => navigate('/produits')}>
            Annuler
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
