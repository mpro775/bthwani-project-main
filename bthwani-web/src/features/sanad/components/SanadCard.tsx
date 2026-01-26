// src/features/sanad/components/SanadCard.tsx
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
  Help as HelpIcon,
  Emergency as EmergencyIcon,
  VolunteerActivism as CharityIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { type SanadItem, SanadStatusLabels, SanadStatusColors, SanadKindLabels, SanadKindColors } from '../types';

interface SanadCardProps {
  item: SanadItem;
  onView?: (item: SanadItem) => void;
}

const getKindIcon = (kind: string) => {
  switch (kind) {
    case 'emergency':
      return <EmergencyIcon />;
    case 'charity':
      return <CharityIcon />;
    default:
      return <HelpIcon />;
  }
};

const SanadCard: React.FC<SanadCardProps> = ({ item, onView }) => {
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {getKindIcon(item.kind)}
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
            </Box>
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
            label={SanadKindLabels[item.kind]}
            size="small"
            sx={{
              backgroundColor: SanadKindColors[item.kind],
              color: 'white',
            }}
            icon={getKindIcon(item.kind)}
          />
          <Chip
            label={SanadStatusLabels[item.status]}
            size="small"
            sx={{
              backgroundColor: SanadStatusColors[item.status],
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

export default SanadCard;
