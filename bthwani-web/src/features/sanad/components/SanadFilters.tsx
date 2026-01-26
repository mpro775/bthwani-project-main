// src/features/sanad/components/SanadFilters.tsx
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
import { type SanadFilters, type SanadStatus, type SanadKind, SanadStatusLabels, SanadKindLabels, SanadKindValues, SanadStatusValues } from '../types';

interface SanadFiltersProps {
  filters: SanadFilters;
  searchQuery: string;
  onFiltersChange: (filters: SanadFilters) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  loading?: boolean;
}

const SanadFiltersComponent: React.FC<SanadFiltersProps> = ({
  filters,
  searchQuery,
  onFiltersChange,
  onSearchChange,
  onReset,
  loading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onSearchChange(value);
  };

  const handleStatusChange = (status: SanadStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status === '' ? undefined : status
    });
  };

  const handleKindChange = (kind: SanadKind | '') => {
    onFiltersChange({
      ...filters,
      kind: kind === '' ? undefined : kind
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (filters.status) count++;
    if (filters.kind) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>فلترة طلبات السند</span>
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
          value={searchQuery}
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
          <InputLabel>النوع</InputLabel>
          <Select
            value={filters.kind || ''}
            label="النوع"
            onChange={(e) => handleKindChange(e.target.value as SanadKind | '')}
          >
            <MenuItem value="">الكل</MenuItem>
            {SanadKindValues.map((kind: SanadKind) => (
              <MenuItem key={kind} value={kind}>
                {SanadKindLabels[kind]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>الحالة</InputLabel>
          <Select
            value={filters.status || ''}
            label="الحالة"
            onChange={(e) => handleStatusChange(e.target.value as SanadStatus | '')}
          >
            <MenuItem value="">الكل</MenuItem>
            {SanadStatusValues.map((status: SanadStatus) => (
              <MenuItem key={status} value={status}>
                {SanadStatusLabels[status]}
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

export default SanadFiltersComponent;
