import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  severity?: 'error' | 'warning' | 'info';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ',
  message = 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  onRetry,
  showRetry = true,
  severity = 'error'
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="250px"
      p={3}
    >
      <Alert
        severity={severity}
        icon={<ErrorOutlineIcon />}
        sx={{
          mb: 3,
          maxWidth: 500,
          width: '100%',
          '& .MuiAlert-message': {
            width: '100%',
            textAlign: 'center'
          }
        }}
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>

      {showRetry && onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ minWidth: 150 }}
        >
          إعادة المحاولة
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
