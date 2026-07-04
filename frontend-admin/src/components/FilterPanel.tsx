import { useState } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useListContext, useTranslate } from 'react-admin';

export type FilterFieldConfig =
  | { source: string; label: string; type: 'select'; choices: { id: string; name: string }[] }
  | { source: string; label: string; type: 'boolean' };

/**
 * A single "Filtrer" button that opens one panel listing every filter field at
 * once (Filament's ListRecords filter panel pattern) — react-admin's own
 * default is a per-field "add filter" dropdown, which this replaces.
 */
export function FilterPanel({ fields }: { fields: FilterFieldConfig[] }) {
  const { filterValues, setFilters, displayedFilters } = useListContext();
  const translate = useTranslate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isActive = (value: unknown) => value !== undefined && value !== '' && value !== false && value !== null;
  const activeCount = fields.filter((f) => isActive(filterValues[f.source])).length;

  const setValue = (source: string, value: unknown) => {
    const next = { ...filterValues };
    if (!isActive(value)) delete next[source];
    else next[source] = value;
    setFilters(next, displayedFilters);
  };

  const reset = () => setFilters({}, displayedFilters);

  return (
    <>
      <Badge color="primary" badgeContent={activeCount} invisible={activeCount === 0}>
        <Button
          variant={activeCount > 0 ? 'contained' : 'outlined'}
          size="small"
          startIcon={<FilterListIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {translate('app.common.filter')}
        </Button>
      </Badge>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            {translate('app.common.filter')}
          </Typography>
          <Stack spacing={2}>
            {fields.map((field) =>
              field.type === 'select' ? (
                <TextField
                  key={field.source}
                  select
                  size="small"
                  label={field.label}
                  value={filterValues[field.source] ?? ''}
                  onChange={(e) => setValue(field.source, e.target.value)}
                >
                  <MenuItem value="">{translate('app.common.all')}</MenuItem>
                  {field.choices.map((choice) => (
                    <MenuItem key={choice.id} value={choice.id}>
                      {choice.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <FormControlLabel
                  key={field.source}
                  control={
                    <Switch
                      checked={Boolean(filterValues[field.source])}
                      onChange={(e) => setValue(field.source, e.target.checked)}
                    />
                  }
                  label={field.label}
                />
              ),
            )}
          </Stack>
          {activeCount > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Button size="small" fullWidth onClick={reset}>
                {translate('app.common.resetFilters')}
              </Button>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}
