import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from './hooks';
import { categorySchema, type CategoryFormValues } from './schemas';
import type { Category } from '@/types';

function CategoryDialog({
  open,
  onClose,
  category,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
}) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    values: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      parentId: category?.parent?.id ?? null,
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const input = { name: values.name, slug: values.slug, parentId: values.parentId || null };
    if (category) {
      await updateMutation.mutateAsync({ id: category.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <TextField
              label="Nom"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Slug"
              fullWidth
              {...register('slug')}
              error={!!errors.slug}
              helperText={errors.slug?.message}
            />
            <TextField label="Catégorie parente" select fullWidth defaultValue={category?.parent?.id ?? ''} {...register('parentId')}>
              <MenuItem value="">Aucune</MenuItem>
              {categories
                .filter((c) => c.id !== category?.id)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Enregistrer
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function CategoryListPage() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();
  const [dialogState, setDialogState] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });

  const sorted = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name)), [categories]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Catégories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogState({ open: true, category: null })}
        >
          Nouvelle catégorie
        </Button>
      </Stack>

      <TableContainer sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Parente</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>{category.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{category.slug}</TableCell>
                <TableCell>{category.parent?.name ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setDialogState({ open: true, category })}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm(`Supprimer la catégorie "${category.name}" ?`)) deleteMutation.mutate(category.id);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Aucune catégorie
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CategoryDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, category: null })}
        category={dialogState.category}
        categories={categories}
      />
    </Box>
  );
}
