// src/features/amani/components/AmaniDetails.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  MyLocation as OriginIcon,
  Flag as DestinationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import type { AmaniItem } from '../types';
import { AmaniStatusLabels, AmaniStatusColors } from '../types';

interface AmaniDetailsProps {
  item: AmaniItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: AmaniItem) => void;
  onDelete?: (item: AmaniItem) => void;
}

const AmaniDetails: React.FC<AmaniDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    onEdit?.(item);
  };

  const handleDelete = () => {
    onDelete?.(item);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            تفاصيل طلب النقل النسائي
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Tooltip title="تعديل الطلب">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="حذف الطلب">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Safety Notice */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>خدمة آمنة:</strong> جميع السائقات في خدمة الأماني حاصلات على رخصة قيادة نسائية وخضعن للتدريبات الأمنية اللازمة.
        </Typography>
      </Alert>

      <Paper sx={{ p: 3 }}>
        {/* Title and Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {item.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={AmaniStatusLabels[item.status]}
              sx={{
                backgroundColor: AmaniStatusColors[item.status],
                color: 'white',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Description */}
        {item.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              الوصف
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {item.description}
            </Typography>
          </Box>
        )}

        {/* Origin and Destination */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1 }} />
            تفاصيل الرحلة
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 6}}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <OriginIcon color="action" />
                  <Typography variant="subtitle2">نقطة الانطلاق</Typography>
                </Box>
                {item.origin?.address && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {item.origin.address}
                  </Typography>
                )}
                {item.origin?.lat && item.origin?.lng && (
                  <Typography variant="body2" color="text.secondary">
                    الإحداثيات: {item.origin.lat.toFixed(6)}, {item.origin.lng.toFixed(6)}
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DestinationIcon color="primary" />
                  <Typography variant="subtitle2">الوجهة</Typography>
                </Box>
                {item.destination?.address && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {item.destination.address}
                  </Typography>
                )}
                {item.destination?.lat && item.destination?.lng && (
                  <Typography variant="body2" color="text.secondary">
                    الإحداثيات: {item.destination.lat.toFixed(6)}, {item.destination.lng.toFixed(6)}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Metadata */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              معلومات إضافية
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(item.metadata).map(([key, value]) => (
                <Grid size={{xs: 12, sm: 6}} key={key}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {key}
                    </Typography>
                    <Typography variant="body2">
                      {String(value)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Owner Information */}
        {item.owner && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              معلومات العميل
            </Typography>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" color="text.secondary">
                    الاسم
                  </Typography>
                  <Typography variant="body1">
                    {item.owner.name}
                  </Typography>
                </Grid>

                {item.owner.email && (
                  <Grid size={{xs: 12, sm: 6}}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      البريد الإلكتروني
                    </Typography>
                    <Typography variant="body1">
                      {item.owner.email}
                    </Typography>
                  </Grid>
                )}

                {item.owner.phone && (
                  <Grid size={{xs: 12, sm: 6}}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      رقم الهاتف
                    </Typography>
                    <Typography variant="body1" sx={{ direction: 'ltr', textAlign: 'left' }}>
                      {item.owner.phone}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Dates */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                تاريخ الطلب
              </Typography>
              <Typography variant="body2">
                {formatDate(item.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                آخر تحديث
              </Typography>
              <Typography variant="body2">
                {formatDate(item.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AmaniDetails;
