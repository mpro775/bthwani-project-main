/**
 * CMS Pages Manager
 * إدارة صفحات CMS
 */

import { useState } from 'react';
import {
  Box,
  Card,
  
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useCMSPages, useContentAPI } from '@/api/content';
import type { CreateCMSPageDto, UpdateCMSPageDto, CMSPage } from '@/types/content';

export default function CMSPagesManager() {
  const { data, loading, error, refetch } = useCMSPages();
  const api = useContentAPI();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [formData, setFormData] = useState<CreateCMSPageDto>({
    title: '',
    slug: '',
    content: '',
    type: 'page',
    isPublished: true,
    metaTitle: '',
    metaDescription: '',
  });

  const handleOpenDialog = (page?: CMSPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        type: page.type,
        isPublished: page.isPublished,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        type: 'page',
        isPublished: true,
        metaTitle: '',
        metaDescription: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPage(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingPage) {
        await api.updateCMSPage(editingPage.id, formData as UpdateCMSPageDto);
      } else {
        await api.createCMSPage(formData);
      }
      refetch();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
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

  const pages = data?.data || [];

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      page: 'صفحة عادية',
      terms: 'الشروط والأحكام',
      privacy: 'سياسة الخصوصية',
      about: 'من نحن',
    };
    return types[type] || type;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">إدارة صفحات CMS</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          إضافة صفحة
        </Button>
      </Box>

      <Card>
        <List>
          {pages.map((page, index) => (
            <ListItem
              key={page.id}
              divider={index < pages.length - 1}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{page.title}</Typography>
                    <Chip
                      label={page.isPublished ? 'منشور' : 'مسودة'}
                      color={page.isPublished ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={getTypeLabel(page.type)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block">
                      Slug: {page.slug}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {page.content.substring(0, 150)}...
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(page)}
                >
                  <Edit />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPage ? 'تعديل صفحة' : 'إضافة صفحة جديدة'}
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
              label="Slug (الرابط)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
              helperText="مثال: about-us, privacy-policy"
            />
            
            <FormControl fullWidth>
              <InputLabel>نوع الصفحة</InputLabel>
              <Select
                value={formData.type}
                label="نوع الصفحة"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="page">صفحة عادية</MenuItem>
                <MenuItem value="terms">الشروط والأحكام</MenuItem>
                <MenuItem value="privacy">سياسة الخصوصية</MenuItem>
                <MenuItem value="about">من نحن</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="المحتوى"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              fullWidth
              multiline
              rows={10}
              helperText="يمكن استخدام HTML"
            />
            
            <TextField
              label="Meta Title"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Meta Description"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
              }
              label="منشور"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPage ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

