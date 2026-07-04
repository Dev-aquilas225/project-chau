import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  DeleteButton,
  EditButton,
  FunctionField,
  List,
  SearchInput,
  TextField,
  TopToolbar,
} from 'react-admin';
import { ActiveFilterChips } from '../../components/ActiveFilterChips';
import { FilterPanel, type FilterFieldConfig } from '../../components/FilterPanel';
import type { PromoCode } from '../../types';

const searchFilters = [<SearchInput key="code" source="code" alwaysOn />];

const filterFields: FilterFieldConfig[] = [
  { source: 'active', label: 'Actif uniquement', type: 'boolean' },
  {
    source: 'discountType',
    label: 'Type de remise',
    type: 'select',
    choices: [
      { id: 'percentage', name: 'Pourcentage' },
      { id: 'fixed', name: 'Montant fixe' },
    ],
  },
];

function PromotionListActions() {
  return (
    <TopToolbar>
      <FilterPanel fields={filterFields} />
      <CreateButton />
    </TopToolbar>
  );
}

export function PromotionList() {
  return (
    <List filters={searchFilters} actions={<PromotionListActions />} sort={{ field: 'createdAt', order: 'DESC' }} perPage={25}>
      <ActiveFilterChips fields={filterFields} />
      <Datagrid>
        <TextField source="code" />
        <FunctionField
          label="Remise"
          render={(record: PromoCode) =>
            record.discountType === 'percentage' ? `${record.discountValue}%` : `${record.discountValue} €`
          }
        />
        <TextField source="minAmount" label="Montant minimum" />
        <DateField source="expiresAt" label="Expiration" />
        <BooleanField source="active" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
}
