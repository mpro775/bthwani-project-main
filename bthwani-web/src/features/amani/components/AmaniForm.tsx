// src/features/amani/components/AmaniForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  MyLocation as OriginIcon,
  Flag as DestinationIcon,
} from '@mui/icons-material';
import type { AmaniItem } from '../types';
import type { CreateAmaniPayload, UpdateAmaniPayload } from '../types';
import type { Location } from '../types';

interface AmaniFormProps {
  item?: AmaniItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (data: CreateAmaniPayload | UpdateAmaniPayload) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

const AmaniForm: React.FC<AmaniFormProps> = ({
  item,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: {
      lat: 0,
      lng: 0,
      address: '',
    } as Location,
    destination: {
      lat: 0,
      lng: 0,
      address: '',
    } as Location,
    metadata: {} as Record<string, any>,
  });

  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        title: item.title,
        description: item.description || '',
        origin: item.origin || { lat: 0, lng: 0, address: '' },
        destination: item.destination || { lat: 0, lng: 0, address: '' },
        metadata: item.metadata || {},
      });
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOriginChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      origin: { ...prev.origin, [field]: value }
    }));
  };

  const handleDestinationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      destination: { ...prev.destination, [field]: value }
    }));
  };

  const handleAddMetadata = () => {
    if (metadataKey.trim() && metadataValue.trim()) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataKey.trim()]: metadataValue.trim()
        }
      }));
      setMetadataKey('');
      setMetadataValue('');
    }
  };

  const handleRemoveMetadata = (key: string) => {
    setFormData(prev => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[key];
      return { ...prev, metadata: newMetadata };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('يرجى إدخال عنوان الطلب');
      return;
    }

    if (!formData.origin.address || !formData.origin.address.trim()) {
      setError('يرجى إدخال عنوان نقطة الانطلاق');
      return;
    }

    if (!formData.destination.address || !formData.destination.address.trim()) {
      setError('يرجى إدخال عنوان الوجهة');
      return;
    }

    try {
      setError(null);

      const submitData = {
        ...formData,
        description: formData.description.trim() || undefined,
        origin: formData.origin.address?.trim() ? formData.origin : undefined,
        destination: formData.destination.address?.trim() ? formData.destination : undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الطلب');
    }
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
        {onCancel && (
          <IconButton onClick={onCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {mode === 'create' ? 'طلب نقل نسائي جديد' : 'تعديل طلب النقل النسائي'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === 'create'
              ? 'أدخل تفاصيل طلب النقل النسائي الآمن'
              : 'قم بتعديل تفاصيل طلب النقل النسائي'
            }
          </Typography>
        </Box>
      </Box>

      {/* Safety Notice */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>خدمة آمنة:</strong> جميع السائقات حاصلات على رخصة قيادة نسائية وخضعن للتدريبات الأمنية اللازمة.
        </Typography>
      </Alert>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Title */}
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="عنوان الطلب"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="مثال: نقل عائلي من الرياض إلى جدة"
              />
            </Grid>

            {/* Origin and Destination */}
            <Grid size={{xs: 12, sm: 6}}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <OriginIcon sx={{ mr: 1, color: 'action' }} />
                نقطة الانطلاق
              </Typography>
              <TextField
                fullWidth
                label="عنوان نقطة الانطلاق"
                value={formData.origin.address}
                onChange={(e) => handleOriginChange('address', e.target.value)}
                required
                placeholder="مثال: الرياض، المملكة العربية السعودية"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="خط العرض (اختياري)"
                type="number"
                value={formData.origin.lat || ''}
                onChange={(e) => handleOriginChange('lat', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.000001 }}
                placeholder="24.7136"
              />
              <TextField
                fullWidth
                label="خط الطول (اختياري)"
                type="number"
                value={formData.origin.lng || ''}
                onChange={(e) => handleOriginChange('lng', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.000001 }}
                placeholder="46.6753"
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DestinationIcon sx={{ mr: 1, color: 'primary' }} />
                الوجهة
              </Typography>
              <TextField
                fullWidth
                label="عنوان الوجهة"
                value={formData.destination.address}
                onChange={(e) => handleDestinationChange('address', e.target.value)}
                required
                placeholder="مثال: جدة، المملكة العربية السعودية"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="خط العرض (اختياري)"
                type="number"
                value={formData.destination.lat || ''}
                onChange={(e) => handleDestinationChange('lat', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.000001 }}
                placeholder="21.4858"
              />
              <TextField
                fullWidth
                label="خط الطول (اختياري)"
                type="number"
                value={formData.destination.lng || ''}
                onChange={(e) => handleDestinationChange('lng', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.000001 }}
                placeholder="39.1925"
                sx={{ mt: 2 }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="الوصف"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder="اوصف الرحلة بالتفصيل (عدد الأفراد، الأمتعة، المتطلبات الخاصة)..."
              />
            </Grid>

            {/* Metadata */}
            <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom>
                معلومات إضافية (اختيارية)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder="المفتاح (مثل: عدد الأفراد)"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  placeholder="القيمة (مثل: 4)"
                  value={metadataValue}
                  onChange={(e) => setMetadataValue(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddMetadata}
                  disabled={!metadataKey.trim() || !metadataValue.trim()}
                >
                  <AddIcon />
                </Button>
              </Box>
              {Object.keys(formData.metadata).length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(formData.metadata).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={`${key}: ${value}`}
                        InputProps={{
                          readOnly: true,
                        }}
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleRemoveMetadata(key)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={saving}
              sx={{ backgroundColor: '#e91e63', '&:hover': { backgroundColor: '#c2185b' } }}
            >
              {saving ? 'جاري الحفظ...' : (mode === 'create' ? 'إرسال طلب النقل' : 'حفظ التغييرات')}
            </Button>

            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={saving}
              >
                إلغاء
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AmaniForm;
