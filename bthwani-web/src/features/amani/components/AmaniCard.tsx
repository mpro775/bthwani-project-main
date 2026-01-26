// src/features/amani/components/AmaniCard.tsx
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
  MyLocation as OriginIcon,
  Flag as DestinationIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { AmaniItem } from '../types';
import { AmaniStatusLabels, AmaniStatusColors } from '../types';

interface AmaniCardProps {
  item: AmaniItem;
  onView?: (item: AmaniItem) => void;
}

const AmaniCard: React.FC<AmaniCardProps> = ({ item, onView }) => {
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

        {/* Origin and Destination */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {item.origin?.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <OriginIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                من: {item.origin.address}
              </Typography>
            </Box>
          )}
          {item.destination?.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DestinationIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                إلى: {item.destination.address}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={AmaniStatusLabels[item.status]}
            size="small"
            sx={{
              backgroundColor: AmaniStatusColors[item.status],
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

export default AmaniCard;
