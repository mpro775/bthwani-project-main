// src/pages/admin/pricing/PricingStrategiesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../utils/axios';

interface PricingTier {
  minDistance: number;
  maxDistance: number;
  pricePerKm: number;
}

interface PricingStrategy {
  _id?: string;
  name: string;
  baseDistance: number;
  basePrice: number;
  tiers: PricingTier[];
  defaultPricePerKm: number;
  createdAt?: string;
  updatedAt?: string;
}

const PricingStrategyFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  strategy?: PricingStrategy | null;
  onSubmit: (data: Omit<PricingStrategy, '_id' | 'createdAt' | 'updatedAt'>) => void;
  loading: boolean;
}> = ({ open, onClose, strategy, onSubmit, loading }) => {
  const [formData, setFormData] = useState<Omit<PricingStrategy, '_id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    baseDistance: 0,
    basePrice: 0,
    tiers: [],
    defaultPricePerKm: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (strategy) {
      setFormData({
        name: strategy.name,
        baseDistance: strategy.baseDistance,
        basePrice: strategy.basePrice,
        tiers: strategy.tiers,
        defaultPricePerKm: strategy.defaultPricePerKm,
      });
    } else {
      setFormData({
        name: '',
        baseDistance: 0,
        basePrice: 0,
        tiers: [],
        defaultPricePerKm: 0,
      });
    }
    setErrors({});
  }, [strategy, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الاستراتيجية مطلوب';
    }

    if (formData.baseDistance < 0) {
      newErrors.baseDistance = 'المسافة الأساسية يجب أن تكون أكبر من أو تساوي صفر';
    }

    if (formData.basePrice < 0) {
      newErrors.basePrice = 'السعر الأساسي يجب أن يكون أكبر من أو تساوي صفر';
    }

    if (formData.defaultPricePerKm < 0) {
      newErrors.defaultPricePerKm = 'سعر الكيلومتر الافتراضي يجب أن يكون أكبر من أو تساوي صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { minDistance: 0, maxDistance: 0, pricePerKm: 0 }]
    }));
  };

  const updateTier = (index: number, field: keyof PricingTier, value: number) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const removeTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {strategy ? 'تعديل استراتيجية التسعير' : 'إضافة استراتيجية تسعير جديدة'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="اسم الاستراتيجية"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="المسافة الأساسية (كم)"
                type="number"
                value={formData.baseDistance}
                onChange={(e) => setFormData(prev => ({ ...prev, baseDistance: Number(e.target.value) }))}
                fullWidth
                error={!!errors.baseDistance}
                helperText={errors.baseDistance}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="السعر الأساسي (ريال)"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                fullWidth
                error={!!errors.basePrice}
                helperText={errors.basePrice}
              />
            </Grid>
          </Grid>

          <TextField
            label="سعر الكيلومتر الافتراضي (ريال)"
            type="number"
            value={formData.defaultPricePerKm}
            onChange={(e) => setFormData(prev => ({ ...prev, defaultPricePerKm: Number(e.target.value) }))}
            fullWidth
            error={!!errors.defaultPricePerKm}
            helperText={errors.defaultPricePerKm}
          />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">شرائح التسعير</Typography>
              <Button startIcon={<AddIcon />} onClick={addTier} variant="outlined">
                إضافة شريحة
              </Button>
            </Box>

            {formData.tiers.map((tier, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        label="من (كم)"
                        type="number"
                        value={tier.minDistance}
                        onChange={(e) => updateTier(index, 'minDistance', Number(e.target.value))}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        label="إلى (كم)"
                        type="number"
                        value={tier.maxDistance}
                        onChange={(e) => updateTier(index, 'maxDistance', Number(e.target.value))}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        label="سعر الكم (ريال)"
                        type="number"
                        value={tier.pricePerKm}
                        onChange={(e) => updateTier(index, 'pricePerKm', Number(e.target.value))}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <IconButton
                        color="error"
                        onClick={() => removeTier(index)}
                        sx={{ mt: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            {formData.tiers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                لا توجد شرائح محددة. السعر الافتراضي سيُستخدم لجميع المسافات.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {strategy ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PricingStrategiesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<PricingStrategy | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PricingStrategy | null>(null);

  const queryClient = useQueryClient();

  // Fetch pricing strategies
  const { data: strategies = [], isLoading, error } = useQuery({
    queryKey: ['pricingStrategies'],
    queryFn: async () => {
      const { data } = await axios.get('/pricing-strategies');
      return data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (strategyData: Omit<PricingStrategy, '_id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await axios.post('/pricing-strategies', strategyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingStrategies'] });
      setDialogOpen(false);
      setEditingStrategy(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ strategy }: { strategy: Partial<PricingStrategy> }) => {
      const { data } = await axios.put(`/pricing-strategies`, strategy);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingStrategies'] });
      setDialogOpen(false);
      setEditingStrategy(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/pricing-strategies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingStrategies'] });
      setDeleteConfirm(null);
    },
  });

  const handleEdit = (strategy: PricingStrategy) => {
    setEditingStrategy(strategy);
    setDialogOpen(true);
  };

  const handleDelete = (strategy: PricingStrategy) => {
    setDeleteConfirm(strategy);
  };

  const handleFormSubmit = (formData: Omit<PricingStrategy, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStrategy) {
      updateMutation.mutate({ strategy: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل استراتيجيات التسعير: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة استراتيجيات التسعير
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingStrategy(null);
            setDialogOpen(true);
          }}
        >
          إضافة استراتيجية جديدة
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم الاستراتيجية</TableCell>
                  <TableCell>المسافة الأساسية</TableCell>
                  <TableCell>السعر الأساسي</TableCell>
                  <TableCell>سعر الكم الافتراضي</TableCell>
                  <TableCell>عدد الشرائح</TableCell>
                  <TableCell>تاريخ الإنشاء</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {strategies.map((strategy: PricingStrategy) => (
                  <TableRow key={strategy._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {strategy.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{strategy.baseDistance} كم</TableCell>
                    <TableCell>{strategy.basePrice} ريال</TableCell>
                    <TableCell>{strategy.defaultPricePerKm} ريال/كم</TableCell>
                    <TableCell>
                      <Chip
                        label={`${strategy.tiers.length} شريحة`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(strategy.createdAt || '').toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(strategy)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleDelete(strategy)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {strategies.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <MoneyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد استراتيجيات تسعير</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ابدأ بإضافة استراتيجية تسعير جديدة لتحديد أسعار التوصيل
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingStrategy(null);
              setDialogOpen(true);
            }}
          >
            إضافة استراتيجية جديدة
          </Button>
        </Box>
      )}

      {/* Pricing Strategy Form Dialog */}
      <PricingStrategyFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingStrategy(null);
        }}
        strategy={editingStrategy}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف استراتيجية التسعير "{deleteConfirm?.name}"؟
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>إلغاء</Button>
          <Button
            onClick={() => {
              if (deleteConfirm?._id) {
                deleteMutation.mutate(deleteConfirm._id);
              }
            }}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={16} /> : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
