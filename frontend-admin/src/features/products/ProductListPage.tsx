import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAdminProducts, useDeleteProduct } from './hooks';
import { useCategories } from '@/features/categories/hooks';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();
  const [search, setSearch] = useState('');

  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term),
    );
  }, [products, search]);

  const columns: GridColDef<Product>[] = [
    { field: 'name', headerName: 'Nom', flex: 1.4, minWidth: 200 },
    { field: 'brand', headerName: 'Marque', flex: 0.8, minWidth: 120 },
    {
      field: 'price',
      headerName: 'Prix',
      flex: 0.6,
      minWidth: 100,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      flex: 0.5,
      minWidth: 90,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.value === 0 ? 'error' : params.value < 5 ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'active',
      headerName: 'Statut',
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => (
        <Chip size="small" label={params.value ? 'Actif' : 'Masqué'} color={params.value ? 'success' : 'default'} />
      ),
    },
    {
      field: 'category',
      headerName: 'Catégorie',
      flex: 0.8,
      minWidth: 130,
      valueGetter: (_value, row) => (row.categoryId ? categoryNameById.get(row.categoryId) ?? '—' : '—'),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => navigate(`/produits/${params.row.id}`)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (confirm(`Supprimer "${params.row.name}" ?`)) deleteMutation.mutate(params.row.id);
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Produits</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/produits/nouveau')}>
          Nouveau produit
        </Button>
      </Stack>

      <TextField
        placeholder="Rechercher par nom ou marque…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 320, bgcolor: 'background.paper' }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      />

      <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ border: 'none' }}
        />
      </Box>
    </Box>
  );
}
