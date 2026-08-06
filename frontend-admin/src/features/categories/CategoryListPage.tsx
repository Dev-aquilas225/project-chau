import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from './hooks';
import { categorySchema, type CategoryFormValues } from './schemas';
import { flattenCategoryTree } from './utils';
import { useHasAnyPermission } from '@/features/auth/usePermission';
import { useConfirm } from '@/components/ConfirmDialogProvider';
import { usePagination } from '@/hooks/usePagination';
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
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    values: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      parentId: category?.parent?.id ?? null,
      active: category?.active ?? true,
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const input = {
      name: values.name,
      slug: values.slug,
      parentId: values.parentId || null,
      active: values.active,
    };
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
              {flattenCategoryTree(categories)
                .filter((c) => c.id !== category?.id)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ pl: 2 + c.depth * 2, fontWeight: c.depth === 0 ? 700 : 400 }}>
                    {c.name}
                  </MenuItem>
                ))}
            </TextField>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={field.value ? 'Visible sur le site client' : 'Masquée sur le site client'}
                />
              )}
            />
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
  const confirm = useConfirm();
  const canManage = useHasAnyPermission('categories', ['create', 'update', 'delete']);
  const { data: categories = [], isLoading } = useCategories();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const [dialogState, setDialogState] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });

  const [search, setSearch] = useState('');

  const tree = useMemo(() => flattenCategoryTree(categories), [categories]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tree;
    return tree.filter((c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term));
  }, [tree, search]);
  const { paginated, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, count } = usePagination(filtered);

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 700 }}>
          Catégories
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogState({ open: true, category: null })}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Nouvelle catégorie
          </Button>
        )}
      </Stack>

      <TextField
        placeholder="Rechercher par nom ou slug…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: '100%', sm: 320 }, bgcolor: 'background.paper' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      <TableContainer
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflowX: 'auto',
          maxWidth: '100%',
        }}
      >
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Nom</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Slug</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Parente</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Statut</TableCell>
              {canManage && <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell sx={{ pl: 2 + category.depth * 3, fontWeight: category.depth === 0 ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {category.name}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{category.slug}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{category.parent?.name ?? '—'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={category.active ?? true ? 'Visible' : 'Masquée'}
                      color={category.active ?? true ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                    {canManage && (
                      <Switch
                        size="small"
                        checked={category.active ?? true}
                        onChange={async (e) => {
                          e.stopPropagation();
                          await updateMutation.mutateAsync({
                            id: category.id,
                            input: { active: e.target.checked },
                          });
                        }}
                      />
                    )}
                  </Stack>
                </TableCell>
                {canManage && (
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" onClick={() => setDialogState({ open: true, category })}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async () => {
                        if (await confirm({ title: `Supprimer la catégorie "${category.name}" ?`, destructive: true })) {
                          deleteMutation.mutate(category.id);
                        }
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Aucune catégorie
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page"
        />
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
