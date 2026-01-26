/**
 * FAQs Manager
 * إدارة الأسئلة الشائعة
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material';
import { useFAQs, useContentAPI } from '@/api/content';
import type { CreateFAQDto, UpdateFAQDto, FAQ } from '@/types/content';

export default function FAQsManager() {
  const { data, loading, error, refetch } = useFAQs();
  const api = useContentAPI();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<CreateFAQDto>({
    question: '',
    answer: '',
    category: 'general',
    priority: 0,
    isActive: true,
  });

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        priority: faq.priority,
        isActive: faq.isActive,
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        question: '',
        answer: '',
        category: 'general',
        priority: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFAQ(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingFAQ) {
        await api.updateFAQ(editingFAQ.id, formData as UpdateFAQDto);
      } else {
        await api.createFAQ(formData);
      }
      refetch();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال?')) {
      try {
        await api.deleteFAQ(id);
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

  const faqs = data?.data || [];

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      general: 'عام',
      orders: 'الطلبات',
      delivery: 'التوصيل',
      payment: 'الدفع',
      account: 'الحساب',
    };
    return categories[category] || category;
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">إدارة الأسئلة الشائعة</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          إضافة سؤال
        </Button>
      </Box>

      {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
        <Box key={category} mb={3}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {getCategoryLabel(category)} ({categoryFAQs.length})
          </Typography>
          <Card>
            {categoryFAQs.map((faq) => (
              <Accordion key={faq.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={1} width="100%">
                    <Typography sx={{ flexGrow: 1 }}>{faq.question}</Typography>
                    {!faq.isActive && (
                      <Chip label="غير نشط" size="small" />
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(faq);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(faq.id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {faq.answer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    الأولوية: {faq.priority}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Card>
        </Box>
      ))}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFAQ ? 'تعديل سؤال' : 'إضافة سؤال جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="السؤال"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            
            <TextField
              label="الإجابة"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              fullWidth
              multiline
              rows={5}
            />
            
            <FormControl fullWidth>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={formData.category}
                label="الفئة"
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <MenuItem value="general">عام</MenuItem>
                <MenuItem value="orders">الطلبات</MenuItem>
                <MenuItem value="delivery">التوصيل</MenuItem>
                <MenuItem value="payment">الدفع</MenuItem>
                <MenuItem value="account">الحساب</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="الأولوية"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              fullWidth
              helperText="الأرقام الأقل تظهر أولاً"
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
            {editingFAQ ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

