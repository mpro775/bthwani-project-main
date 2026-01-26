// src/pages/errors/ErrorPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import WifiOffIcon from '@mui/icons-material/WifiOff';

interface ErrorPageProps {
  type?: '401' | '403' | '404' | '500' | 'network' | 'unknown';
  title?: string;
  message?: string;
  code?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

const ERROR_CONFIG = {
  '401': {
    title: 'تسجيل الدخول مطلوب',
    message: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة',
    icon: <LockIcon sx={{ fontSize: 64, color: 'warning.main' }} />,
    severity: 'warning' as const,
    primaryAction: 'تسجيل الدخول',
    primaryPath: '/admin/login',
  },
  '403': {
    title: 'غير مسموح بالوصول',
    message: 'ليس لديك صلاحية كافية للوصول إلى هذا المحتوى',
    icon: <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />,
    severity: 'error' as const,
    primaryAction: 'العودة',
    primaryPath: -1,
  },
  '404': {
    title: 'الصفحة غير موجودة',
    message: 'عذراً، الصفحة التي تبحث عنها غير متوفرة',
    icon: <SearchOffIcon sx={{ fontSize: 64, color: 'info.main' }} />,
    severity: 'info' as const,
    primaryAction: 'العودة',
    primaryPath: -1,
  },
  '500': {
    title: 'خطأ في الخادم',
    message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
    icon: <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />,
    severity: 'error' as const,
    primaryAction: 'إعادة المحاولة',
    primaryPath: -1,
  },
  'network': {
    title: 'مشكلة في الاتصال',
    message: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
    icon: <WifiOffIcon sx={{ fontSize: 64, color: 'warning.main' }} />,
    severity: 'warning' as const,
    primaryAction: 'إعادة المحاولة',
    primaryPath: -1,
  },
  'unknown': {
    title: 'خطأ غير معروف',
    message: 'حدث خطأ غير متوقع',
    icon: <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />,
    severity: 'error' as const,
    primaryAction: 'العودة',
    primaryPath: -1,
  },
};

const ErrorPage: React.FC<ErrorPageProps> = ({
  type = 'unknown',
  title,
  message,
  code,
  showHomeButton = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const errorConfig = ERROR_CONFIG[type];
  const displayTitle = title || errorConfig.title;
  const displayMessage = message || errorConfig.message;

  const handlePrimaryAction = () => {
    if (typeof errorConfig.primaryPath === 'string') {
      navigate(errorConfig.primaryPath, {
        state: { from: location },
        replace: true
      });
    } else {
      navigate(errorConfig.primaryPath);
    }
  };

  const handleSecondaryAction = () => {
    navigate('/admin/dashboard');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 3 }}>
          {errorConfig.icon}
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          {displayTitle}
        </Typography>

        <Alert severity={errorConfig.severity} sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body1">
            {displayMessage}
          </Typography>
          {code && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontFamily: 'monospace',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1,
                display: 'inline-block'
              }}
            >
              رمز الخطأ: <strong>{code}</strong>
            </Typography>
          )}
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handlePrimaryAction}
            size="large"
          >
            {errorConfig.primaryAction}
          </Button>

          {showHomeButton && (
            <Button
              variant="outlined"
              onClick={handleSecondaryAction}
              size="large"
            >
              لوحة التحكم الرئيسية
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ErrorPage;

// Hook for error handling
export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (
    type: ErrorPageProps['type'],
    customTitle?: string,
    customMessage?: string,
    code?: string
  ) => {
    navigate('/admin/error', {
      state: {
        type,
        title: customTitle,
        message: customMessage,
        code,
      },
      replace: true,
    });
  };

  const handle401 = (message?: string) => handleError('401', undefined, message);
  const handle403 = (message?: string, code?: string) => handleError('403', undefined, message, code);
  const handle404 = (message?: string) => handleError('404', undefined, message);
  const handle500 = (message?: string, code?: string) => handleError('500', undefined, message, code);

  return {
    handleError,
    handle401,
    handle403,
    handle404,
    handle500,
  };
};
