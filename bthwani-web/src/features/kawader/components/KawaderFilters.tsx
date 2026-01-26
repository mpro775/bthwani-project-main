// src/features/kawader/components/KawaderFilters.tsx
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
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import type { KawaderFilters, KawaderStatus } from '../types';
import { KawaderStatusLabels, KawaderStatusValues } from '../types';

interface KawaderFiltersProps {
  filters: KawaderFilters;
  onFiltersChange: (filters: KawaderFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

const KawaderFiltersComponent: React.FC<KawaderFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (status: KawaderStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status === '' ? undefined : status
    });
  };

  const handleBudgetMinChange = (value: string) => {
    const budgetMin = value ? parseFloat(value) : undefined;
    onFiltersChange({ ...filters, budgetMin });
  };

  const handleBudgetMaxChange = (value: string) => {
    const budgetMax = value ? parseFloat(value) : undefined;
    onFiltersChange({ ...filters, budgetMax });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.budgetMin !== undefined) count++;
    if (filters.budgetMax !== undefined) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>فلترة العروض الوظيفية</span>
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
            onChange={(e) => handleStatusChange(e.target.value as KawaderStatus | '')}
          >
            <MenuItem value="">الكل</MenuItem>
            {KawaderStatusValues.map((status: KawaderStatus) => (
              <MenuItem key={status} value={status}>
                {KawaderStatusLabels[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="الميزانية من"
          type="number"
          value={filters.budgetMin || ''}
          onChange={(e) => handleBudgetMinChange(e.target.value)}
          InputProps={{
            startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action' }} />,
            endAdornment: <Typography variant="body2" color="text.secondary">ريال</Typography>,
          }}
          inputProps={{ min: 0 }}
          sx={{ minWidth: 150 }}
          size="small"
        />

        <TextField
          label="الميزانية إلى"
          type="number"
          value={filters.budgetMax || ''}
          onChange={(e) => handleBudgetMaxChange(e.target.value)}
          InputProps={{
            startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action' }} />,
            endAdornment: <Typography variant="body2" color="text.secondary">ريال</Typography>,
          }}
          inputProps={{ min: 0 }}
          sx={{ minWidth: 150 }}
          size="small"
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

export default KawaderFiltersComponent;
