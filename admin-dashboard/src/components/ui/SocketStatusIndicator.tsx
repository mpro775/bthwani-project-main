import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Wifi as ConnectedIcon, WifiOff as DisconnectedIcon } from '@mui/icons-material';

interface SocketStatusIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export const SocketStatusIndicator: React.FC<SocketStatusIndicatorProps> = ({
  isConnected,
  className
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      className={className}
    >
      {isConnected ? (
        <Chip
          icon={<ConnectedIcon />}
          label="متصل"
          color="success"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiChip-icon': {
              color: 'success.main',
            },
          }}
        />
      ) : (
        <Chip
          icon={<DisconnectedIcon />}
          label="غير متصل"
          color="error"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiChip-icon': {
              color: 'error.main',
            },
          }}
        />
      )}
      <Typography variant="caption" color="text.secondary">
        {isConnected ? 'تحديث لحظي متاح' : 'يعمل في وضع الاستطلاع'}
      </Typography>
    </Box>
  );
};

export default SocketStatusIndicator;
