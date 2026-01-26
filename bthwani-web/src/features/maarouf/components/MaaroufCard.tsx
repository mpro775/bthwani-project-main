// src/features/maarouf/components/MaaroufCard.tsx
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
  Label as TagIcon,
  Category as KindIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { MaaroufItem } from '../types';
import { MaaroufKindLabels, MaaroufStatusLabels, MaaroufKindColors, MaaroufStatusColors } from '../types';

interface MaaroufCardProps {
  item: MaaroufItem;
  onView?: (item: MaaroufItem) => void;
}

const MaaroufCard: React.FC<MaaroufCardProps> = ({ item, onView }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={MaaroufKindLabels[item.kind]}
            color={MaaroufKindColors[item.kind] === '#f44336' ? 'error' : 'success'}
            size="small"
            icon={<KindIcon />}
            variant="outlined"
          />
          <Chip
            label={MaaroufStatusLabels[item.status]}
            size="small"
            sx={{
              backgroundColor: MaaroufStatusColors[item.status],
              color: 'white',
            }}
          />
        </Box>

        {item.tags && item.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
            <TagIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            {item.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
            {item.tags.length > 3 && (
              <Chip
                label={`+${item.tags.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
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

export default MaaroufCard;
