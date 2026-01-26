import React from 'react';
import { Badge, Box, Typography } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  onClick,
  size = 'medium'
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const badgeSize = {
    small: { fontSize: '0.75rem', minWidth: '16px', height: '16px' },
    medium: { fontSize: '0.875rem', minWidth: '20px', height: '20px' },
    large: { fontSize: '1rem', minWidth: '24px', height: '24px' }
  };

  if (count === 0) {
    return (
      <Box
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          opacity: 0.7
        }}
      >
        <NotificationsIcon sx={{ fontSize: size === 'small' ? 20 : size === 'large' ? 28 : 24 }} />
        <Typography variant="body2" color="text.secondary">
          لا توجد إشعارات جديدة
        </Typography>
      </Box>
    );
  }

  return (
    <Badge
      badgeContent={displayCount}
      color="error"
      max={maxCount}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '& .MuiBadge-badge': {
          ...badgeSize[size],
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'background.paper',
        }
      }}
    >
      <NotificationsIcon
        sx={{
          fontSize: size === 'small' ? 20 : size === 'large' ? 28 : 24,
          color: count > 0 ? 'error.main' : 'action.active'
        }}
      />
    </Badge>
  );
};

export default NotificationBadge;
