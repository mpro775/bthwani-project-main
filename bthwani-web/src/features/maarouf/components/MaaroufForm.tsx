// src/features/maarouf/components/MaaroufForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import type { MaaroufItem, MaaroufKind, CreateMaaroufPayload, UpdateMaaroufPayload } from '../types';
import { MaaroufKindLabels, MaaroufKindValues } from '../types';


interface MaaroufFormProps {
  item?: MaaroufItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (data: CreateMaaroufPayload | UpdateMaaroufPayload) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

const MaaroufForm: React.FC<MaaroufFormProps> = ({
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
    kind: 'lost' as MaaroufKind,
    tags: [] as string[],
    metadata: {} as Record<string, any>,
  });

  const [tagInput, setTagInput] = useState('');
  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        title: item.title,
        description: item.description || '',
        kind: item.kind,
        tags: item.tags || [],
        metadata: item.metadata || {},
      });
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
      setError('يرجى إدخال عنوان الإعلان');
      return;
    }

    try {
      setError(null);

      const submitData = {
        ...formData,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الإعلان');
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
            {mode === 'create' ? 'إعلان جديد' : 'تعديل الإعلان'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === 'create'
              ? 'أدخل تفاصيل الإعلان عن المفقود أو الموجود'
              : 'قم بتعديل تفاصيل الإعلان'
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
            <Grid  size={{xs: 12}}>
              <TextField
                fullWidth
                label="عنوان الإعلان"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="مثال: محفظة سوداء مفقودة في منطقة النرجس"
              />
            </Grid>

            {/* Kind */}
            <Grid  size={{xs: 12, sm: 6}}>
              <FormControl fullWidth required>
                <InputLabel>نوع الإعلان</InputLabel>
                <Select
                  value={formData.kind}
                  label="نوع الإعلان"
                  onChange={(e) => handleInputChange('kind', e.target.value as MaaroufKind)}
                >
                  {MaaroufKindValues.map((kind) => (
                    <MenuItem key={kind} value={kind}>
                      {MaaroufKindLabels[kind]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid  size={{xs: 12}}>
              <TextField
                fullWidth
                label="الوصف"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder="اوصف الشيء المفقود أو الموجود بالتفصيل..."
              />
            </Grid>

            {/* Tags */}
            <Grid  size={{xs: 12}}>
              <Typography variant="h6" gutterBottom>
                العلامات
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="أضف علامة (مثل: محفظة، سوداء، النرجس)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <AddIcon />
                </Button>
              </Box>
              {formData.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Metadata */}
            <Grid  size={{xs: 12}}>
              <Typography variant="h6" gutterBottom>
                معلومات إضافية (اختيارية)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder="المفتاح (مثل: اللون)"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  placeholder="القيمة (مثل: أسود)"
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
                      <Chip
                        label={`${key}: ${value}`}
                        onDelete={() => handleRemoveMetadata(key)}
                        color="secondary"
                        variant="outlined"
                      />
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
              {saving ? 'جاري الحفظ...' : (mode === 'create' ? 'إنشاء الإعلان' : 'حفظ التغييرات')}
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

export default MaaroufForm;
