// src/features/arabon/components/ArabonForm.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { uploadArabonImageToBunny } from '../../../utils/uploadToBunny';
import type { ArabonItem } from '../types';
import type { CreateArabonPayload, UpdateArabonPayload } from '../types';

const MAX_IMAGES = 8;
const ARABON_CATEGORIES = ['منشأة', 'شاليه', 'صالة', 'أخرى'];

interface ArabonFormProps {
  item?: ArabonItem;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (data: CreateArabonPayload | UpdateArabonPayload) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
  ownerId?: string;
}

const ArabonForm: React.FC<ArabonFormProps> = ({
  item,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  mode,
  ownerId = '',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    depositAmount: '',
    scheduleAt: '',
    metadata: { guests: undefined as number | undefined, notes: '' } as { guests?: number; notes?: string },
    contactPhone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    category: '',
    bookingPrice: '',
    bookingPeriod: 'day' as 'hour' | 'day' | 'week',
    pricePerPeriod: '',
    status: 'draft' as string,
  });

  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        title: item.title,
        description: item.description || '',
        depositAmount: item.depositAmount ? String(item.depositAmount) : '',
        scheduleAt: item.scheduleAt ? new Date(item.scheduleAt).toISOString().slice(0, 16) : '',
        metadata: { guests: item.metadata?.guests, notes: item.metadata?.notes || '' },
        contactPhone: item.contactPhone || '',
        whatsapp: item.socialLinks?.whatsapp || '',
        facebook: item.socialLinks?.facebook || '',
        instagram: item.socialLinks?.instagram || '',
        category: item.category || '',
        bookingPrice: item.bookingPrice ? String(item.bookingPrice) : '',
        bookingPeriod: (item.bookingPeriod as 'hour' | 'day' | 'week') || 'day',
        pricePerPeriod: item.pricePerPeriod ? String(item.pricePerPeriod) : '',
        status: item.status,
      });
      setImages(item.images || []);
    }
  }, [item, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || images.length >= MAX_IMAGES) return;
    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length && images.length < MAX_IMAGES; i++) {
        const url = await uploadArabonImageToBunny(files[i]);
        setImages(prev => [...prev, url].slice(0, MAX_IMAGES));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصور');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('يرجى إدخال عنوان العربون');
      return;
    }
    if (mode === 'create' && !ownerId) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setError(null);

      const submitData: CreateArabonPayload | UpdateArabonPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        scheduleAt: formData.scheduleAt || undefined,
        metadata: {
          guests: formData.metadata?.guests,
          notes: formData.metadata?.notes?.trim() || undefined,
        },
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : undefined,
        images: images.length ? images : undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        socialLinks: (formData.whatsapp || formData.facebook || formData.instagram)
          ? {
              whatsapp: formData.whatsapp || undefined,
              facebook: formData.facebook || undefined,
              instagram: formData.instagram || undefined,
            }
          : undefined,
        category: formData.category || undefined,
        bookingPrice: formData.bookingPrice ? parseFloat(formData.bookingPrice) : undefined,
        bookingPeriod: formData.bookingPeriod,
        pricePerPeriod: formData.pricePerPeriod ? parseFloat(formData.pricePerPeriod) : undefined,
      };

      if (mode === 'create') {
        (submitData as CreateArabonPayload).ownerId = ownerId;
        (submitData as CreateArabonPayload).status = formData.status;
      } else if (mode === 'edit') {
        (submitData as UpdateArabonPayload).status = formData.status as any;
      }

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ العربون');
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
            {mode === 'create' ? 'إضافة إعلان استئجار' : 'تعديل العربون'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === 'create'
              ? 'أدخل تفاصيل العربون الجديد'
              : 'قم بتعديل تفاصيل العربون'
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
                label="عنوان الإعلان"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="مثال: شاليه فاخر للإيجار"
              />
            </Grid>

            {/* Category */}
            <Grid size={{xs: 12, sm: 6}}>
              <FormControl fullWidth>
                <InputLabel>نوع العقار</InputLabel>
                <Select
                  value={formData.category}
                  label="نوع العقار"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <MenuItem value="">اختر النوع</MenuItem>
                  {ARABON_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Images */}
            <Grid size={{xs: 12}}>
              <Typography variant="subtitle1" gutterBottom>صور العقار (حد أقصى {MAX_IMAGES})</Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {images.map((url, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={url}
                      alt=""
                      sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                      onClick={() => removeImage(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {images.length < MAX_IMAGES && (
                  <Button
                    variant="outlined"
                    startIcon={uploadingImages ? <CircularProgress size={20} /> : <ImageIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages || saving}
                  >
                    إضافة صور
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Contact & Social */}
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="رقم التواصل للحجز"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+967771234567"
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="رابط واتساب" value={formData.whatsapp} onChange={(e) => handleInputChange('whatsapp', e.target.value)} placeholder="https://wa.me/967771234567" sx={{ mb: 1 }} />
              <TextField fullWidth label="رابط فيسبوك" value={formData.facebook} onChange={(e) => handleInputChange('facebook', e.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth label="رابط إنستغرام" value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} />
            </Grid>

            {/* Booking Period & Price */}
            <Grid size={{xs: 12, sm: 6}}>
              <FormControl fullWidth>
                <InputLabel>فترة الحجز</InputLabel>
                <Select
                  value={formData.bookingPeriod}
                  label="فترة الحجز"
                  onChange={(e) => handleInputChange('bookingPeriod', e.target.value as 'hour' | 'day' | 'week')}
                >
                  <MenuItem value="hour">بالساعة</MenuItem>
                  <MenuItem value="day">باليوم</MenuItem>
                  <MenuItem value="week">بالأسبوع</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="السعر لكل فترة (ريال)"
                type="number"
                value={formData.pricePerPeriod}
                onChange={(e) => handleInputChange('pricePerPeriod', e.target.value)}
                placeholder="500"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="قيمة الحجز الكاملة (ريال)"
                type="number"
                value={formData.bookingPrice}
                onChange={(e) => handleInputChange('bookingPrice', e.target.value)}
                placeholder="اختياري"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Deposit Amount */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="قيمة العربون (ريال)"
                type="number"
                value={formData.depositAmount}
                onChange={(e) => handleInputChange('depositAmount', e.target.value)}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action' }} />,
                  endAdornment: <Typography variant="body2" color="text.secondary">ريال</Typography>,
                }}
                placeholder="مثال: 250"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Schedule */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="موعد التنفيذ"
                type="datetime-local"
                value={formData.scheduleAt}
                onChange={(e) => handleInputChange('scheduleAt', e.target.value)}
                InputProps={{
                  startAdornment: <EventIcon sx={{ mr: 1, color: 'action' }} />,
                }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16)
                }}
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
                placeholder="اوصف العرض أو الحجز بالتفصيل..."
              />
            </Grid>

            {/* Metadata - عدد الأشخاص وملاحظات */}
            <Grid size={{xs: 12}}>
              <Typography variant="subtitle1" gutterBottom>بيانات إضافية</Typography>
              <TextField
                fullWidth
                label="عدد الأشخاص"
                type="number"
                value={formData.metadata?.guests ?? ''}
                onChange={(e) => handleInputChange('metadata', { ...formData.metadata, guests: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                placeholder="اختياري"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="ملاحظات"
                multiline
                rows={2}
                value={formData.metadata?.notes ?? ''}
                onChange={(e) => handleInputChange('metadata', { ...formData.metadata, notes: e.target.value })}
                placeholder="ملاحظات"
                maxLength={200}
              />
            </Grid>

            {/* الحالة - Create: مسودة/في الانتظار، Edit: الكل */}
            <Grid size={{xs: 12}}>
              <Typography variant="subtitle1" gutterBottom>
                {mode === 'create' ? 'الحالة الأولية' : 'حالة العربون'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(mode === 'create' ? [{ key: 'draft', label: 'مسودة' }, { key: 'pending', label: 'في الانتظار' }] : [
                  { key: 'draft', label: 'مسودة' }, { key: 'pending', label: 'في الانتظار' },
                  { key: 'confirmed', label: 'مؤكد' }, { key: 'completed', label: 'مكتمل' }, { key: 'cancelled', label: 'ملغي' }
                ]).map((opt: { key: string; label: string }) => (
                  <Chip
                    key={opt.key}
                    label={opt.label}
                    onClick={() => handleInputChange('status', opt.key)}
                    color={formData.status === opt.key ? 'primary' : 'default'}
                    variant={formData.status === opt.key ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
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

export default ArabonForm;
