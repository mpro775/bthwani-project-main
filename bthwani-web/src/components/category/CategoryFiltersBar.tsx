import React from "react";
import {
  Box,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Star as StarIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingIcon,
  FeaturedPlayList as FeaturedIcon,
} from "@mui/icons-material";

interface CategoryFiltersBarProps {
  onChange: (id: string) => void;
}

const CategoryFiltersBar: React.FC<CategoryFiltersBarProps> = ({ onChange }) => {
  const filters = [
    {
      id: "topRated",
      label: "الأعلى تقييماً",
      icon: <StarIcon sx={{ fontSize: 16 }} />,
      color: "#ffc107",
    },
    {
      id: "nearest",
      label: "الأقرب",
      icon: <LocationIcon sx={{ fontSize: 16 }} />,
      color: "#4caf50",
    },
    {
      id: "favorite",
      label: "المفضلة",
      icon: <FavoriteIcon sx={{ fontSize: 16 }} />,
      color: "#e91e63",
    },
    {
      id: "trending",
      label: "الرائجة",
      icon: <TrendingIcon sx={{ fontSize: 16 }} />,
      color: "#ff6b6b",
    },
    {
      id: "featured",
      label: "مميزة",
      icon: <FeaturedIcon sx={{ fontSize: 16 }} />,
      color: "#9c27b0",
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 'bold',
          mr: 1,
          whiteSpace: 'nowrap',
        }}
      >
        فلترة حسب:
      </Typography>

      {filters.map((filter) => (
        <Tooltip key={filter.id} title={filter.label} arrow>
        <Chip
          label={filter.label}
          icon={filter.icon}
          onClick={() => onChange(filter.id)}
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid',
            borderColor: 'rgba(102, 126, 234, 0.2)',
            color: 'text.primary',
            fontSize: '0.8rem',
            height: 32,
            '&:hover': {
              background: `linear-gradient(135deg, ${filter.color}15, ${filter.color}08)`,
              borderColor: filter.color,
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 8px ${filter.color}30`,
            },
            '& .MuiChip-icon': {
              color: filter.color,
            },
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          variant="outlined"
        />
      </Tooltip>
      ))}

      <Chip
        label="مسح الفلاتر"
        onClick={() => onChange("clear")}
        sx={{
          background: 'transparent',
          border: '1px solid',
          borderColor: 'grey.400',
          color: 'grey.600',
          fontSize: '0.75rem',
          height: 28,
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.04)',
            borderColor: 'grey.500',
          },
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        variant="outlined"
      />
    </Box>
  );
};

export default CategoryFiltersBar;
