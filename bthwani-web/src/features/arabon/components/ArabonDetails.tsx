// src/features/arabon/components/ArabonDetails.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
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
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import type { ArabonItem } from '../types';
import { ArabonStatusLabels, ArabonStatusColors } from '../types';

interface ArabonDetailsProps {
  item: ArabonItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: ArabonItem) => void;
  onDelete?: (item: ArabonItem) => void;
}

const ArabonDetails: React.FC<ArabonDetailsProps> = ({
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
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
            تفاصيل العربون
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Tooltip title="تعديل العربون">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="حذف العربون">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Images */}
        {item.images && item.images.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {item.images.map((url, i) => (
              <Box
                key={i}
                component="img"
                src={url}
                alt=""
                sx={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 1 }}
              />
            ))}
          </Box>
        )}

        {/* Title and Status */}
        <Box sx={{ mb: 3 }}>
          {item.category && (
            <Chip label={item.category} size="small" sx={{ mb: 1 }} />
          )}
          <Typography variant="h5" gutterBottom>
            {item.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={ArabonStatusLabels[item.status]}
              size="small"
              sx={{
                backgroundColor: ArabonStatusColors[item.status],
                color: 'white',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Contact & Social */}
        {(item.contactPhone || item.socialLinks) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1 }} />
              التواصل والحجز
            </Typography>
            {item.contactPhone && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <a href={`tel:${item.contactPhone}`}>{item.contactPhone}</a>
              </Typography>
            )}
            {item.socialLinks && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {item.socialLinks.whatsapp && (
                  <Chip label="واتساب" component="a" href={item.socialLinks.whatsapp} target="_blank" rel="noopener" clickable />
                )}
                {item.socialLinks.facebook && (
                  <Chip label="فيسبوك" component="a" href={item.socialLinks.facebook} target="_blank" rel="noopener" clickable />
                )}
                {item.socialLinks.instagram && (
                  <Chip label="إنستغرام" component="a" href={item.socialLinks.instagram} target="_blank" rel="noopener" clickable />
                )}
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Pricing */}
        {(item.pricePerPeriod || item.bookingPrice || item.depositAmount) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MoneyIcon sx={{ mr: 1 }} />
              التسعير
            </Typography>
            {item.pricePerPeriod && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                السعر لكل فترة: {formatCurrency(item.pricePerPeriod)}{' '}
                {item.bookingPeriod === 'hour' ? 'ريال/ساعة' : item.bookingPeriod === 'day' ? 'ريال/يوم' : 'ريال/أسبوع'}
              </Typography>
            )}
            {item.bookingPrice && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                قيمة الحجز: {formatCurrency(item.bookingPrice)}
              </Typography>
            )}
            {item.depositAmount && (
              <Typography variant="h6" color="primary" fontWeight="bold">
                قيمة العربون المطلوب تحويلها: {formatCurrency(item.depositAmount)}
              </Typography>
            )}
          </Box>
        )}

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

        {/* Schedule */}
        {item.scheduleAt && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 1 }} />
              موعد التنفيذ
            </Typography>
            <Typography variant="body1">
              {formatDate(item.scheduleAt)}
            </Typography>
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
              معلومات المالك
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
                    <Typography variant="body1">
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
                تاريخ الإنشاء
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

export default ArabonDetails;
