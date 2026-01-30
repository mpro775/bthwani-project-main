// src/features/arabon/components/ArabonCard.tsx
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
  Visibility as ViewIcon,
  Event as EventIcon,
  Call as CallIcon,
} from '@mui/icons-material';
import type { ArabonItem } from '../types';
import { ArabonStatusLabels, ArabonStatusColors } from '../types';

const BOOKING_LABELS: Record<string, string> = {
  hour: 'ريال/ساعة',
  day: 'ريال/يوم',
  week: 'ريال/أسبوع',
};

interface ArabonCardProps {
  item: ArabonItem;
  onView?: (item: ArabonItem) => void;
}

const ArabonCard: React.FC<ArabonCardProps> = ({ item, onView }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const priceLabel = item.pricePerPeriod
    ? `${item.pricePerPeriod} ${BOOKING_LABELS[item.bookingPeriod || 'day'] || ''}`
    : item.bookingPrice
      ? `${item.bookingPrice} ريال`
      : item.depositAmount
        ? `${item.depositAmount} ريال عربون`
        : null;

  const handleView = () => {
    onView?.(item);
  };

  const primaryImage = item.images?.[0];

  return (
    <Card sx={{ mb: 2, cursor: onView ? 'pointer' : 'default', overflow: 'hidden' }} onClick={onView ? handleView : undefined}>
      {primaryImage && (
        <Box
          component="img"
          src={primaryImage}
          alt=""
          sx={{ width: '100%', height: 160, objectFit: 'cover' }}
        />
      )}
      <CardContent>
        {item.category && (
          <Chip label={item.category} size="small" sx={{ mb: 1 }} />
        )}
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

        {priceLabel && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MoneyIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              {priceLabel}
            </Typography>
          </Box>
        )}

        {item.contactPhone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CallIcon fontSize="small" color="primary" />
            <Typography variant="body2">{item.contactPhone}</Typography>
          </Box>
        )}

        {item.scheduleAt && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EventIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {formatDateTime(item.scheduleAt)}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={ArabonStatusLabels[item.status]}
            size="small"
            sx={{
              backgroundColor: ArabonStatusColors[item.status],
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

export default ArabonCard;
