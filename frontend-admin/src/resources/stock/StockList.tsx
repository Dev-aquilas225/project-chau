import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { Title, useDataProvider, useGetList, useNotify, useRefresh } from 'react-admin';
import { KpiCard } from '../../components/KpiCard';
import { PageContainer } from '../../components/PageContainer';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import type { Product } from '../../types';

const LOW_THRESHOLD = 2;

function StockRow({ product }: { product: Product }) {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [value, setValue] = useState(product.stock);

  const save = async () => {
    try {
      await dataProvider.update('products', {
        id: product.id,
        data: { stock: value },
        previousData: product,
      });
      notify('Stock mis à jour.', { type: 'success' });
      refresh();
    } catch {
      notify('Mise à jour impossible.', { type: 'error' });
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: product.stock === 0 ? 'error.50' : undefined,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} textTransform="uppercase">
          {product.brand}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {product.name}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ width: 120 }}>
        {product.stock === 0 ? 'Rupture' : `${product.stock} en stock`}
      </Typography>
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        sx={{ width: 100 }}
      />
      <Button variant="outlined" size="small" disabled={value === product.stock} onClick={save}>
        Enregistrer
      </Button>
    </Stack>
  );
}

export function StockList() {
  const { data, isPending } = useGetList<Product>('products', {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: 'stock', order: 'ASC' },
    filter: {},
  });
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  const products = data ?? [];
  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_THRESHOLD);

  const visibleProducts = useMemo(() => {
    return products
      .filter((p) => (lowOnly ? p.stock <= LOW_THRESHOLD : true))
      .filter((p) => {
        if (!search) return true;
        const haystack = `${p.brand} ${p.name}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      });
  }, [products, search, lowOnly]);

  return (
    <PageContainer title="Gestion du stock" subtitle="Suivez les niveaux de stock et ajustez-les en un clic.">
      <Title title="Gestion du stock" />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <KpiCard icon={WarehouseIcon} label="En rupture" value={String(outOfStock.length)} hint="Produits à réapprovisionner" />
        <KpiCard
          icon={WarehouseIcon}
          label={`Stock faible (≤ ${LOW_THRESHOLD})`}
          value={String(lowStock.length)}
          hint="Produits bientôt en rupture"
        />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          control={<Switch checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />}
          label={`Stock faible uniquement (≤ ${LOW_THRESHOLD})`}
        />
      </Stack>

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', overflow: 'hidden' }}>
        {isPending && (
          <Typography variant="body2" sx={{ p: 2 }}>
            Chargement…
          </Typography>
        )}
        {!isPending && visibleProducts.length === 0 && (
          <Typography variant="body2" sx={{ p: 2 }}>
            Aucun produit.
          </Typography>
        )}
        {visibleProducts.map((product) => (
          <StockRow key={product.id} product={product} />
        ))}
      </Box>
    </PageContainer>
  );
}
