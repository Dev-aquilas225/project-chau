import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useListContext } from 'react-admin';
import type { FilterFieldConfig } from './FilterPanel';

/** Removable pills for each active filter, shown above the table (Filament-style). */
export function ActiveFilterChips({ fields }: { fields: FilterFieldConfig[] }) {
  const { filterValues, setFilters, displayedFilters } = useListContext();

  const active = fields
    .map((field) => {
      const value = filterValues[field.source];
      if (value === undefined || value === '' || value === false || value === null) return null;
      const display =
        field.type === 'select' ? (field.choices.find((c) => c.id === value)?.name ?? String(value)) : field.label;
      return { source: field.source, label: `${field.label} : ${display}` };
    })
    .filter((chip): chip is { source: string; label: string } => chip !== null);

  if (active.length === 0) return null;

  const remove = (source: string) => {
    const next = { ...filterValues };
    delete next[source];
    setFilters(next, displayedFilters);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', px: 2, pt: 2 }}>
      {active.map((chip) => (
        <Chip key={chip.source} label={chip.label} size="small" onDelete={() => remove(chip.source)} />
      ))}
    </Box>
  );
}
