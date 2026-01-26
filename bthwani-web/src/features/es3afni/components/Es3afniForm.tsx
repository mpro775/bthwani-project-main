// src/features/es3afni/components/Es3afniForm.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Bloodtype as BloodIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import type { Es3afniItem, BloodType, CreateEs3afniPayload, UpdateEs3afniPayload, Location } from '../types';
import { BloodTypeLabels, BloodTypeValues } from '../types';

interface Es3afniFormProps {
  item?: Es3afniItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (data: CreateEs3afniPayload | UpdateEs3afniPayload) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

const Es3afniForm: React.FC<Es3afniFormProps> = ({
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
    bloodType: 'O+' as BloodType,
    location: {
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
        bloodType: item.bloodType || 'O+' as BloodType,
        location: item.location || { lat: 0, lng: 0, address: '' },
        metadata: item.metadata || {},
      });
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
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
      setError('يرجى إدخال عنوان البلاغ');
      return;
    }

    if (!formData.bloodType) {
      setError('يرجى تحديد فصيلة الدم');
      return;
    }

    if (!formData.location.address || !formData.location.address.trim()) {
      setError('يرجى إدخال عنوان الموقع');
      return;
    }

    try {
      setError(null);

      const submitData = {
        ...formData,
        description: formData.description.trim() || undefined,
        location: formData.location.address.trim() ? formData.location : undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ البلاغ');
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
            {mode === 'create' ? 'بلاغ عاجل جديد' : 'تعديل البلاغ'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === 'create'
              ? 'أدخل تفاصيل البلاغ العاجل لتبرع بالدم'
              : 'قم بتعديل تفاصيل البلاغ'
            }
          </Typography>
        </Box>
      </Box>

      {/* Emergency Notice */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>تنبيه:</strong> هذا بلاغ عاجل لتبرع بالدم. يرجى التأكد من دقة المعلومات والتواصل الفوري مع المحتاجين.
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
                label="عنوان البلاغ"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="مثال: حاجة عاجلة لفصيلة O+ في الرياض"
              />
            </Grid>

            {/* Blood Type */}
            <Grid size={{xs: 12, sm: 6}}>
              <FormControl fullWidth required>
                <InputLabel>فصيلة الدم المطلوبة</InputLabel>
                <Select
                  value={formData.bloodType}
                  label="فصيلة الدم المطلوبة"
                  onChange={(e) => handleInputChange('bloodType', e.target.value as BloodType)}
                  startAdornment={<BloodIcon sx={{ mr: 1, color: 'error' }} />}
                >
                  {BloodTypeValues.map((bloodType: BloodType) => (
                    <MenuItem key={bloodType} value={bloodType}>
                      {BloodTypeLabels[bloodType]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Location Address */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="عنوان الموقع"
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                required
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'action' }} />,
                }}
                placeholder="مثال: مستشفى الملك فيصل، الرياض"
              />
            </Grid>

            {/* Location Coordinates (Optional) */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="خط العرض (اختياري)"
                type="number"
                value={formData.location.lat || ''}
                onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.000001 }}
                placeholder="24.7136"
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="خط الطول (اختياري)"
                type="number"
                value={formData.location.lng || ''}
                onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                inputProps={{ step: 0.000001 }}
                placeholder="46.6753"
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
                placeholder="اوصف الحالة بالتفصيل والمعلومات المهمة..."
              />
            </Grid>

            {/* Metadata */}
            <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom>
                معلومات إضافية (اختيارية)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder="المفتاح (مثل: عدد الوحدات المطلوبة)"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  placeholder="القيمة (مثل: 3)"
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
              color="error"
            >
              {saving ? 'جاري الحفظ...' : (mode === 'create' ? 'نشر البلاغ العاجل' : 'حفظ التغييرات')}
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

export default Es3afniForm;
