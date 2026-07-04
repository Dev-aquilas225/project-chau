import {
  Datagrid,
  ExportButton,
  FunctionField,
  List,
  NumberField,
  SelectInput,
  TextField,
  TopToolbar,
} from 'react-admin';
import { ActiveFilterChips } from '../../components/ActiveFilterChips';
import { FilterPanel, type FilterFieldConfig } from '../../components/FilterPanel';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order } from '../../types';

// ===== CONSTANTES =====

const STATUS_CHOICES = [
  { id: 'pending', name: 'En attente' },
  { id: 'paid', name: 'Payé' },
  { id: 'shipped', name: 'Expédié' },
  { id: 'delivered', name: 'Livré' },
  { id: 'cancelled', name: 'Annulé' },
];

const PAYMENT_CHOICES = [
  { id: 'card', name: 'Carte bancaire' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'klarna', name: 'Klarna' },
];

const SEARCH_FILTERS = [
  <SelectInput
    key="status"
    source="status"
    alwaysOn
    choices={STATUS_CHOICES}
  />,
];

const FILTER_FIELDS: FilterFieldConfig[] = [
  {
    source: 'paymentMethod',
    label: 'Moyen de paiement',
    type: 'select',
    choices: PAYMENT_CHOICES,
  },
];

// ===== COMPOSANTS =====

function OrderListActions() {
  return (
    <TopToolbar>
      <FilterPanel fields={FILTER_FIELDS} />
      <ExportButton />
    </TopToolbar>
  );
}

export function OrderList() {
  return (
    <List
      filters={SEARCH_FILTERS}
      actions={<OrderListActions />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={25}
    >
      <ActiveFilterChips fields={FILTER_FIELDS} />
      <Datagrid rowClick="show">
        <TextField source="id" label="Commande" />
        <FunctionField
          label="Articles"
          render={(record: Order) => record.items.length}
        />
        <NumberField
          source="total"
          options={{ style: 'currency', currency: 'EUR' }}
        />
        <FunctionField
          label="Statut"
          render={(record: Order) => <StatusBadge status={record.status} />}
        />
        <TextField source="paymentMethod" label="Moyen de paiement" />
      </Datagrid>
    </List>
  );
}