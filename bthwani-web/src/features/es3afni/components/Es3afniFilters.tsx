// src/features/es3afni/components/Es3afniFilters.tsx
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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Bloodtype as BloodIcon,
} from "@mui/icons-material";
import type { Es3afniFilters } from "../types";
import type { Es3afniStatus } from "../types";
import type { BloodType, Es3afniUrgency } from "../types";
import {
  Es3afniStatusLabels,
  BloodTypeLabels,
  BloodTypeValues,
  Es3afniStatusValues,
  URGENCY_LABELS,
  URGENCY_LEVELS,
} from "../types";

interface Es3afniFiltersProps {
  filters: Es3afniFilters;
  onFiltersChange: (filters: Es3afniFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

const Es3afniFiltersComponent: React.FC<Es3afniFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (status: Es3afniStatus | "") => {
    onFiltersChange({
      ...filters,
      status: status === "" ? undefined : status,
    });
  };

  const handleBloodTypeChange = (bloodType: BloodType | "") => {
    onFiltersChange({
      ...filters,
      bloodType: bloodType === "" ? undefined : bloodType,
    });
  };

  const handleUrgencyChange = (urgency: Es3afniUrgency | "") => {
    onFiltersChange({
      ...filters,
      urgency: urgency === "" ? undefined : urgency,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.bloodType) count++;
    if (filters.urgency) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>فلترة البلاغات</span>
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
          <InputLabel>فصيلة الدم</InputLabel>
          <Select
            value={filters.bloodType || ""}
            label="فصيلة الدم"
            onChange={(e) =>
              handleBloodTypeChange(e.target.value as BloodType | "")
            }
          >
            <MenuItem value="">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <BloodIcon sx={{ mr: 1, opacity: 0.5 }} />
                الكل
              </Box>
            </MenuItem>
            {BloodTypeValues.map((bloodType: BloodType) => (
              <MenuItem key={bloodType} value={bloodType}>
                {BloodTypeLabels[bloodType]}
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
              handleStatusChange(e.target.value as Es3afniStatus | "")
            }
          >
            <MenuItem value="">الكل</MenuItem>
            {Es3afniStatusValues.map((status: Es3afniStatus) => (
              <MenuItem key={status} value={status}>
                {Es3afniStatusLabels[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>الأولوية</InputLabel>
          <Select
            value={filters.urgency || ""}
            label="الأولوية"
            onChange={(e) =>
              handleUrgencyChange(e.target.value as Es3afniUrgency | "")
            }
          >
            <MenuItem value="">الكل</MenuItem>
            {URGENCY_LEVELS.map((urgency: Es3afniUrgency) => (
              <MenuItem key={urgency} value={urgency}>
                {URGENCY_LABELS[urgency]}
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

export default Es3afniFiltersComponent;
