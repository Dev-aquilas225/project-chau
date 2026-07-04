import Chip from '@mui/material/Chip';
import { Datagrid, EmailField, FunctionField, List, SearchInput, TopToolbar, TextField } from 'react-admin';
import { ActiveFilterChips } from '../../components/ActiveFilterChips';
import { FilterPanel, type FilterFieldConfig } from '../../components/FilterPanel';
import type { UserProfile } from '../../types';

const searchFilters = [<SearchInput key="q" source="q" alwaysOn />];

const filterFields: FilterFieldConfig[] = [
  {
    source: 'role',
    label: 'Rôle',
    type: 'select',
    choices: [
      { id: 'customer', name: 'Client' },
      { id: 'admin', name: 'Admin' },
    ],
  },
];

function UserListActions() {
  return (
    <TopToolbar>
      <FilterPanel fields={filterFields} />
    </TopToolbar>
  );
}

export function UserList() {
  return (
    <List filters={searchFilters} actions={<UserListActions />} sort={{ field: 'createdAt', order: 'DESC' }} perPage={25}>
      <ActiveFilterChips fields={filterFields} />
      <Datagrid rowClick="edit">
        <TextField source="displayName" label="Nom" />
        <EmailField source="email" />
        <FunctionField
          label="Rôle"
          render={(record: UserProfile) => (
            <Chip
              label={record.role === 'admin' ? 'Admin' : 'Client'}
              size="small"
              color={record.role === 'admin' ? 'primary' : 'default'}
            />
          )}
        />
      </Datagrid>
    </List>
  );
}
