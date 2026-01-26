// src/features/kawader/components/KawaderForm.tsx
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
  AttachMoney as MoneyIcon,
  WorkOutline as WorkIcon,
} from '@mui/icons-material';
import type { KawaderItem } from '../types';
import type { CreateKawaderPayload, UpdateKawaderPayload } from '../types';

interface KawaderFormProps {
  item?: KawaderItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (data: CreateKawaderPayload | UpdateKawaderPayload) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

const KawaderForm: React.FC<KawaderFormProps> = ({
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
    scope: '',
    budget: '',
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
        scope: item.scope || '',
        budget: item.budget ? String(item.budget) : '',
        metadata: item.metadata || {},
      });
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      setError('يرجى إدخال عنوان العرض الوظيفي');
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      setError('يرجى إدخال ميزانية صحيحة');
      return;
    }

    try {
      setError(null);

      const submitData = {
        ...formData,
        budget: parseFloat(formData.budget),
        description: formData.description.trim() || undefined,
        scope: formData.scope.trim() || undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ العرض الوظيفي');
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
            {mode === 'create' ? 'عرض وظيفي جديد' : 'تعديل العرض الوظيفي'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === 'create'
              ? 'أدخل تفاصيل العرض الوظيفي الجديد'
              : 'قم بتعديل تفاصيل العرض الوظيفي'
            }
          </Typography>
        </Box>
      </Box>

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
                label="عنوان العرض الوظيفي"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="مثال: مطور Full Stack مطلوب لمشروع تقني"
              />
            </Grid>

            {/* Budget */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="الميزانية"
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                required
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action' }} />,
                  endAdornment: <Typography variant="body2" color="text.secondary">ريال</Typography>,
                }}
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Scope */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="نطاق العمل"
                value={formData.scope}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                InputProps={{
                  startAdornment: <WorkIcon sx={{ mr: 1, color: 'action' }} />,
                }}
                placeholder="مثال: مشروع 6 أشهر"
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
                placeholder="اوصف الوظيفة أو الخدمة المهنية بالتفصيل..."
              />
            </Grid>

            {/* Metadata */}
              <Grid size={{xs: 12}}>
              <Typography variant="h6" gutterBottom>
                معلومات إضافية (اختيارية)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder="المفتاح (مثل: الخبرة المطلوبة)"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  placeholder="القيمة (مثل: 3+ سنوات)"
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
            >
              {saving ? 'جاري الحفظ...' : (mode === 'create' ? 'إنشاء العرض الوظيفي' : 'حفظ التغييرات')}
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

export default KawaderForm;
