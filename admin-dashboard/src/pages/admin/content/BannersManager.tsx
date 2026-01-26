/**
 * Banners Manager
 * إدارة البانرات الإعلانية
 */

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useBanners, useContentAPI } from '@/api/content';
import type { CreateBannerDto, UpdateBannerDto, Banner } from '@/types/content';

export default function BannersManager() {
  const { data, loading, error, refetch } = useBanners();
  const api = useContentAPI();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<CreateBannerDto>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    placement: 'home',
    priority: 0,
    isActive: true,
  });

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description || '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || '',
        placement: banner.placement,
        priority: banner.priority,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        placement: 'home',
        priority: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBanner(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, formData as UpdateBannerDto);
      } else {
        await api.createBanner(formData);
      }
      refetch();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البانر?')) {
      try {
        await api.deleteBanner(id);
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">خطأ في تحميل البيانات: {error.message}</Alert>
      </Box>
    );
  }

  const banners = data?.data || [];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">إدارة البانرات الإعلانية</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          إضافة بانر
        </Button>
      </Box>

      <Grid container spacing={3}>
        {banners.map((banner) => (
          <Grid  size={{xs: 12, md: 6, lg: 4}} key={banner.id}>
            <Card>
              <Box
                component="img"
                src={banner.imageUrl}
                alt={banner.title}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                }}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6" gutterBottom>
                    {banner.title}
                  </Typography>
                  <Chip
                    label={banner.isActive ? 'نشط' : 'غير نشط'}
                    color={banner.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                {banner.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {banner.description}
                  </Typography>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    الموضع: {banner.placement}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    الأولوية: {banner.priority}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    النقرات: {banner.clicks} | المشاهدات: {banner.impressions}
                  </Typography>
                </Box>

                <Box display="flex" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => window.open(banner.linkUrl, '_blank')}
                    disabled={!banner.linkUrl}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(banner)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBanner ? 'تعديل بانر' : 'إضافة بانر جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="العنوان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="الوصف"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            
            <TextField
              label="رابط الصورة"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="رابط الوجهة"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>الموضع</InputLabel>
              <Select
                value={formData.placement}
                label="الموضع"
                onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
              >
                <MenuItem value="home">الصفحة الرئيسية</MenuItem>
                <MenuItem value="category">صفحة الأقسام</MenuItem>
                <MenuItem value="product">صفحة المنتج</MenuItem>
                <MenuItem value="checkout">صفحة الدفع</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="الأولوية"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              fullWidth
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="نشط"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBanner ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

