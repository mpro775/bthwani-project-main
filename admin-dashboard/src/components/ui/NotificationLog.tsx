import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PushPin as PushIcon,
  CheckCircle as SentIcon,
  Error as FailedIcon,
  Schedule as ScheduledIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

interface NotificationLogEntry {
  id: string;
  title: string;
  message: string;
  channel: 'push' | 'sms' | 'email' | 'inapp';
  status: 'sent' | 'failed' | 'scheduled' | 'delivered';
  timestamp: string;
  recipientCount?: number;
  actor?: string;
}

interface NotificationLogProps {
  entries: NotificationLogEntry[];
  onMarkAsRead?: (id: string) => void;
  onRetry?: (id: string) => void;
  maxEntries?: number;
}

export const NotificationLog: React.FC<NotificationLogProps> = ({
  entries,
  onRetry,
  maxEntries = 50
}) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push':
        return <PushIcon color="primary" />;
      case 'sms':
        return <SmsIcon color="secondary" />;
      case 'email':
        return <EmailIcon color="info" />;
      case 'inapp':
        return <NotificationsIcon color="action" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <SentIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <FailedIcon sx={{ color: 'error.main' }} />;
      case 'scheduled':
        return <ScheduledIcon sx={{ color: 'warning.main' }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;

    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  const displayedEntries = entries.slice(0, maxEntries);

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" component="h2">
          سجل الإشعارات الأخيرة
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          آخر {Math.min(entries.length, maxEntries)} إشعار
        </Typography>
      </Box>

      {displayedEntries.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            لا توجد إشعارات حديثة
          </Typography>
        </Box>
      ) : (
        <List sx={{ py: 0 }}>
          {displayedEntries.map((entry, index) => (
            <React.Fragment key={entry.id}>
              <ListItem
                sx={{
                  px: 2,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={getStatusIcon(entry.status)}
                      label={entry.status === 'sent' ? 'تم الإرسال' :
                             entry.status === 'failed' ? 'فشل' :
                             entry.status === 'scheduled' ? 'مجدول' : 'تم التوصيل'}
                      color={getStatusColor(entry.status)}
                      size="small"
                    />
                    {entry.status === 'failed' && onRetry && (
                      <Tooltip title="إعادة المحاولة">
                        <IconButton
                          size="small"
                          onClick={() => onRetry(entry.id)}
                          sx={{ color: 'warning.main' }}
                        >
                          <NotificationsIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              >
                <ListItemIcon>
                  {getChannelIcon(entry.channel)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">
                        {entry.title}
                      </Typography>
                      {entry.recipientCount && (
                        <Chip
                          label={`${entry.recipientCount} مستلم`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {entry.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(entry.timestamp)}
                          {entry.actor && ` • بواسطة ${entry.actor}`}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < displayedEntries.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationLog;
