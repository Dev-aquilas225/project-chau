import {
  BooleanField,
  CreateButton,
  Datagrid,
  EditButton,
  ExportButton,
  FunctionField,
  List,
  NumberField,
  SearchInput,
  TextField,
  TopToolbar,
} from 'react-admin';
import { ActiveFilterChips } from '../../components/ActiveFilterChips';
import { FilterPanel, type FilterFieldConfig } from '../../components/FilterPanel';
import { StatusBadge } from '../../components/StatusBadge';
import type { Product } from '../../types';

const searchFilters = [<SearchInput key="name" source="name" alwaysOn />];

const filterFields: FilterFieldConfig[] = [
  {
    source: 'listingStatus',
    label: 'Statut',
    type: 'select',
    choices: [
      { id: 'draft', name: 'Brouillon' },
      { id: 'active', name: 'Actif' },
      { id: 'archived', name: 'Archivé' },
    ],
  },
  { source: 'active', label: 'Actif uniquement', type: 'boolean' },
  { source: 'weLove', label: 'Coup de cœur uniquement', type: 'boolean' },
];

function ProductListActions() {
  return (
    <TopToolbar>
      <FilterPanel fields={filterFields} />
      <CreateButton />
      <ExportButton />
    </TopToolbar>
  );
}

export function ProductList() {
  return (
    <List filters={searchFilters} actions={<ProductListActions />} sort={{ field: 'createdAt', order: 'DESC' }} perPage={25}>
      <ActiveFilterChips fields={filterFields} />
      <Datagrid rowClick="edit">
        <TextField source="name" />
        <TextField source="brand" />
        <NumberField source="price" options={{ style: 'currency', currency: 'EUR' }} />
        <NumberField source="stock" />
        <FunctionField
          label="Statut"
          render={(record: Product) => <StatusBadge status={record.listingStatus} />}
        />
        <BooleanField source="active" />
        <EditButton />
      </Datagrid>
    </List>
  );
}
