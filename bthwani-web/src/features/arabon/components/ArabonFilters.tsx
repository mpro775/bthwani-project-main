// src/features/arabon/components/ArabonFilters.tsx
import React from 'react';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { ArabonFilters, ArabonStatus } from '../types';
import { ArabonStatusLabels, ArabonStatusValues } from '../types';

interface ArabonFiltersProps {
  filters: ArabonFilters;
  onFiltersChange: (filters: ArabonFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

const ArabonFiltersComponent: React.FC<ArabonFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (status: ArabonStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status === '' ? undefined : status
    });
  };

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>فلترة العربونات</span>
          {getActiveFiltersCount() > 0 && (
            <Chip
              label={`${getActiveFiltersCount()} نشط`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="البحث في العناوين والأوصاف..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
          size="small"
        />

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>الحالة</InputLabel>
          <Select
            value={filters.status || ''}
            label="الحالة"
            onChange={(e) => handleStatusChange(e.target.value as ArabonStatus | '')}
          >
            <MenuItem value="">الكل</MenuItem>
            {ArabonStatusValues.map((status: ArabonStatus) => (
              <MenuItem key={status} value={status}>
                {ArabonStatusLabels[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="من تاريخ"
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => handleDateFromChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="إلى تاريخ"
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => handleDateToChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
          sx={{ minWidth: 150 }}
        />

        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<ClearIcon />}
          disabled={loading}
        >
          إعادة تعيين
        </Button>
      </Box>
    </Paper>
  );
};

export default ArabonFiltersComponent;
