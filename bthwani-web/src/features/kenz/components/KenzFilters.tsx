// src/features/kenz/components/KenzFilters.tsx
import React from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import type {
  KenzFilters,
  KenzStatus,
  KenzCategory,
  KenzDeliveryOption,
} from "../types";
import {
  KenzStatusLabels,
  KenzCategoryLabels,
  KenzStatusValues,
  KenzCategoryValues,
  KenzDeliveryOptionLabels,
} from "../types";

interface KenzFiltersProps {
  filters: KenzFilters;
  onFiltersChange: (filters: KenzFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

const KenzFiltersComponent: React.FC<KenzFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (status: KenzStatus | "") => {
    onFiltersChange({
      ...filters,
      status: status === "" ? undefined : status,
    });
  };

  const handleCategoryChange = (category: KenzCategory | "") => {
    onFiltersChange({
      ...filters,
      category: category === "" ? undefined : category,
    });
  };

  const handlePriceMinChange = (value: string) => {
    const priceMin = value ? parseFloat(value) : undefined;
    onFiltersChange({ ...filters, priceMin });
  };

  const handlePriceMaxChange = (value: string) => {
    const priceMax = value ? parseFloat(value) : undefined;
    onFiltersChange({ ...filters, priceMax });
  };

  const handleDeliveryOptionChange = (
    deliveryOption: KenzDeliveryOption | "",
  ) => {
    onFiltersChange({
      ...filters,
      deliveryOption: deliveryOption === "" ? undefined : deliveryOption,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.priceMin !== undefined) count++;
    if (filters.priceMax !== undefined) count++;
    if (filters.deliveryOption) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>فلترة الإعلانات</span>
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

      <Box
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        <TextField
          placeholder="البحث في العناوين والأوصاف..."
          value={filters.search || ""}
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
          <InputLabel>الفئة</InputLabel>
          <Select
            value={filters.category || ""}
            label="الفئة"
            onChange={(e) =>
              handleCategoryChange(e.target.value as KenzCategory | "")
            }
          >
            <MenuItem value="">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CategoryIcon sx={{ mr: 1, opacity: 0.5 }} />
                الكل
              </Box>
            </MenuItem>
            {KenzCategoryValues.map((category: KenzCategory) => (
              <MenuItem key={category} value={category}>
                {KenzCategoryLabels[category]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>الحالة</InputLabel>
          <Select
            value={filters.status || ""}
            label="الحالة"
            onChange={(e) =>
              handleStatusChange(e.target.value as KenzStatus | "")
            }
          >
            <MenuItem value="">الكل</MenuItem>
            {KenzStatusValues.map((status: KenzStatus) => (
              <MenuItem key={status} value={status}>
                {KenzStatusLabels[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>طريقة التسليم</InputLabel>
          <Select
            value={filters.deliveryOption || ""}
            label="طريقة التسليم"
            onChange={(e) =>
              handleDeliveryOptionChange(
                e.target.value as KenzDeliveryOption | "",
              )
            }
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="meetup">
              {KenzDeliveryOptionLabels.meetup}
            </MenuItem>
            <MenuItem value="delivery">
              {KenzDeliveryOptionLabels.delivery}
            </MenuItem>
            <MenuItem value="both">{KenzDeliveryOptionLabels.both}</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="السعر من"
          type="number"
          value={filters.priceMin || ""}
          onChange={(e) => handlePriceMinChange(e.target.value)}
          InputProps={{
            startAdornment: <MoneyIcon sx={{ mr: 1, color: "action" }} />,
            endAdornment: (
              <Typography variant="body2" color="text.secondary">
                ريال
              </Typography>
            ),
          }}
          inputProps={{ min: 0 }}
          sx={{ minWidth: 150 }}
          size="small"
        />

        <TextField
          label="السعر إلى"
          type="number"
          value={filters.priceMax || ""}
          onChange={(e) => handlePriceMaxChange(e.target.value)}
          InputProps={{
            startAdornment: <MoneyIcon sx={{ mr: 1, color: "action" }} />,
            endAdornment: (
              <Typography variant="body2" color="text.secondary">
                ريال
              </Typography>
            ),
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

export default KenzFiltersComponent;
