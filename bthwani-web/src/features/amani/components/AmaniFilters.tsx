// src/features/amani/components/AmaniFilters.tsx
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
import type { AmaniFilters, AmaniStatus } from '../types';
import { AmaniStatusLabels, AmaniStatusValues } from '../types';

interface AmaniFiltersProps {
  filters: AmaniFilters;
  onFiltersChange: (filters: AmaniFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

const AmaniFiltersComponent: React.FC<AmaniFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (status: AmaniStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status === '' ? undefined : status
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>فلترة طلبات النقل النسائي</span>
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
            onChange={(e) => handleStatusChange(e.target.value as AmaniStatus | '')}
          >
            <MenuItem value="">الكل</MenuItem>
            {AmaniStatusValues.map((status: AmaniStatus) => (
              <MenuItem key={status} value={status}>
                {AmaniStatusLabels[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

export default AmaniFiltersComponent;
