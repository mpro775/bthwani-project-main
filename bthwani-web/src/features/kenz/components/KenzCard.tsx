// src/features/kenz/components/KenzCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { KenzItem } from '../types';
import { KenzStatusLabels, KenzCategoryLabels, KenzStatusColors, KenzCategoryColors } from '../types';

interface KenzCardProps {
  item: KenzItem;
  onView?: (item: KenzItem) => void;
}

const KenzCard: React.FC<KenzCardProps> = ({ item, onView }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const handleView = () => {
    onView?.(item);
  };

  return (
    <Card sx={{ mb: 2, cursor: onView ? 'pointer' : 'default' }} onClick={onView ? handleView : undefined}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {item.title}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {item.description.length > 100
                  ? `${item.description.substring(0, 100)}...`
                  : item.description
                }
              </Typography>
            )}
          </Box>
          {onView && (
            <Tooltip title="عرض التفاصيل">
              <IconButton onClick={(e) => { e.stopPropagation(); handleView(); }}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Price */}
        {item.price && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MoneyIcon fontSize="small" color="action" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatCurrency(item.price)}
            </Typography>
          </Box>
        )}

        {/* Category */}
        {item.category && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={KenzCategoryLabels[item.category]}
              size="small"
              sx={{
                backgroundColor: KenzCategoryColors[item.category],
                color: 'white',
              }}
              icon={<CategoryIcon />}
            />
            <Chip
              label={KenzStatusLabels[item.status]}
              size="small"
              sx={{
                backgroundColor: KenzStatusColors[item.status],
                color: 'white',
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {item.owner?.name || 'غير محدد'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {formatDate(item.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KenzCard;
