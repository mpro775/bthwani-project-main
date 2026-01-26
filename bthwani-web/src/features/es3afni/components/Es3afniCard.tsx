// src/features/es3afni/components/Es3afniCard.tsx
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
  LocationOn as LocationIcon,
  Bloodtype as BloodIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { Es3afniItem } from '../types';
import { Es3afniStatusLabels, BloodTypeLabels, Es3afniStatusColors, BloodTypeColors } from '../types';

interface Es3afniCardProps {
  item: Es3afniItem;
  onView?: (item: Es3afniItem) => void;
}

const Es3afniCard: React.FC<Es3afniCardProps> = ({ item, onView }) => {
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

        {/* Blood Type */}
        {item.bloodType && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BloodIcon fontSize="small" color="error" />
            <Chip
              label={BloodTypeLabels[item.bloodType]}
              size="small"
              sx={{
                backgroundColor: BloodTypeColors[item.bloodType],
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        )}

        {/* Location */}
        {item.location?.address && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {item.location.address}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={Es3afniStatusLabels[item.status]}
            size="small"
            sx={{
              backgroundColor: Es3afniStatusColors[item.status],
              color: 'white',
            }}
          />
        </Box>

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

export default Es3afniCard;
