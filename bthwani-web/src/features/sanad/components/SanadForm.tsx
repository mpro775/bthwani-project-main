// src/features/sanad/components/SanadForm.tsx
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
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Help as HelpIcon,
  Emergency as EmergencyIcon,
  VolunteerActivism as CharityIcon,
} from '@mui/icons-material';
import { SanadKindLabels, SanadKindValues } from '../types';
import type { SanadItem, CreateSanadPayload, UpdateSanadPayload, SanadKind } from '../types';

interface SanadFormProps {
  item?: SanadItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (data: CreateSanadPayload | UpdateSanadPayload) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

const SanadForm: React.FC<SanadFormProps> = ({
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
    kind: 'specialist' as SanadKind,
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
        kind: item.kind,
        metadata: item.metadata || {},
      });
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKindChange = (kind: SanadKind) => {
    setFormData(prev => ({ ...prev, kind }));
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

    if (!formData.kind) {
      setError('يرجى اختيار نوع الطلب');
      return;
    }

    try {
      setError(null);

      const submitData = {
        ...formData,
        description: formData.description.trim() || undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الطلب');
    }
  };

  const getKindIcon = (kind: SanadKind) => {
    switch (kind) {
      case 'emergency':
        return <EmergencyIcon sx={{ mr: 1, color: '#f44336' }} />;
      case 'charity':
        return <CharityIcon sx={{ mr: 1, color: '#4caf50' }} />;
      default:
        return <HelpIcon sx={{ mr: 1, color: '#3f51b5' }} />;
    }
  };

  const getKindDescription = (kind: SanadKind) => {
    switch (kind) {
      case 'specialist':
        return 'خدمات متخصصة مثل صيانة، إصلاح، استشارات فنية';
      case 'emergency':
        return 'حالات طارئة تحتاج تدخل فوري ومساعدة عاجلة';
      case 'charity':
        return 'أعمال خيرية ومساعدات إنسانية وتبرعات';
      default:
        return '';
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
            {mode === 'create' ? 'طلب سند جديد' : 'تعديل طلب السند'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === 'create'
              ? 'اختر نوع الخدمة وأدخل تفاصيل الطلب'
              : 'قم بتعديل تفاصيل طلب السند'
            }
          </Typography>
        </Box>
      </Box>

      {/* Emergency Warning */}
      {formData.kind === 'emergency' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>تحذير:</strong> هذا طلب فزعة طارئة. تأكد من أن الحالة تستحق التدخل الطارئ قبل الإرسال.
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Kind Selection */}
            {/* @ts-expect-error - MUI v7 Grid type issue with item prop */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                اختر نوع الطلب
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={formData.kind}
                  onChange={(e) => handleKindChange(e.target.value as SanadKind)}
                >
                  {SanadKindValues.map((kind) => (
                    <Paper
                      key={kind}
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 1,
                        borderColor: formData.kind === kind ? '#9c27b0' : 'divider',
                        backgroundColor: formData.kind === kind ? '#f3e5f5' : 'transparent',
                      }}
                    >
                      <FormControlLabel
                        value={kind}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getKindIcon(kind)}
                            <Box>
                              <Typography variant="subtitle1">
                                {SanadKindLabels[kind]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {getKindDescription(kind)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Title */}
            {/* @ts-expect-error - MUI v7 Grid type issue with item prop */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="عنوان الطلب"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder={
                  formData.kind === 'emergency'
                    ? 'مثال: فزعة طبية عاجلة'
                    : formData.kind === 'charity'
                    ? 'مثال: مساعدة عائلة محتاجة'
                    : 'مثال: إصلاح جهاز كهربائي'
                }
              />
            </Grid>

            {/* Description */}
            {/* @ts-expect-error - MUI v7 Grid type issue with item prop */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الوصف"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder={
                  formData.kind === 'emergency'
                    ? 'اوصف الحالة الطارئة بالتفصيل والإجراءات المطلوبة...'
                    : formData.kind === 'charity'
                    ? 'اوصف نوع المساعدة المطلوبة والظروف...'
                    : 'اوصف الخدمة المطلوبة والتفاصيل الفنية...'
                }
              />
            </Grid>

            {/* Metadata */}
            {/* @ts-expect-error - MUI v7 Grid type issue with item prop */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                معلومات إضافية (اختيارية)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder="المفتاح (مثل: الموقع)"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  placeholder="القيمة (مثل: الرياض)"
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
              sx={{ backgroundColor: '#9c27b0', '&:hover': { backgroundColor: '#7b1fa2' } }}
            >
              {saving ? 'جاري الحفظ...' : (mode === 'create' ? 'إرسال طلب السند' : 'حفظ التغييرات')}
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

export default SanadForm;
