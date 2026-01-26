// src/features/es3afni/components/Es3afniDetails.tsx
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
  Bloodtype as BloodIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import type { Es3afniItem } from '../types';
import { Es3afniStatusLabels, BloodTypeLabels, Es3afniStatusColors, BloodTypeColors } from '../types';

interface Es3afniDetailsProps {
  item: Es3afniItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: Es3afniItem) => void;
  onDelete?: (item: Es3afniItem) => void;
}

const Es3afniDetails: React.FC<Es3afniDetailsProps> = ({
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
      {/* Emergency Alert */}
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>بلاغ عاجل لتبرع بالدم!</strong> يرجى التواصل فوراً مع الشخص المسؤول عن البلاغ.
        </Typography>
      </Alert>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            تفاصيل البلاغ
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Tooltip title="تعديل البلاغ">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="حذف البلاغ">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Title and Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {item.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={Es3afniStatusLabels[item.status]}
              sx={{
                backgroundColor: Es3afniStatusColors[item.status],
                color: 'white',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Blood Type */}
        {item.bloodType && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BloodIcon sx={{ mr: 1, color: 'error' }} />
              فصيلة الدم المطلوبة
            </Typography>
            <Chip
              label={BloodTypeLabels[item.bloodType]}
              size="medium"
              sx={{
                backgroundColor: BloodTypeColors[item.bloodType],
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                height: 40,
              }}
            />
          </Box>
        )}

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

        {/* Location */}
        {item.location && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1 }} />
              الموقع
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {item.location.address && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {item.location.address}
                </Typography>
              )}
              {item.location.lat && item.location.lng && (
                <Typography variant="body2" color="text.secondary">
                  الإحداثيات: {item.location.lat.toFixed(6)}, {item.location.lng.toFixed(6)}
                </Typography>
              )}
            </Paper>
          </Box>
        )}

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
              معلومات الاتصال
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
                تاريخ النشر
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

export default Es3afniDetails;
