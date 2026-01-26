import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Subscriptions as SubscriptionIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  deleteSubscription,
  getSubscriptionStats,
  getSubscriptionPlans,
  type SubscriptionFormData
} from '../../api/subscriptions';
import type { Subscription } from '../../api/wallet';
import type { SelectChangeEvent } from '@mui/material/Select';

const SubscriptionFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  subscription?: Subscription | null;
  onSubmit: (data: SubscriptionFormData) => void;
  loading: boolean;
  plans: { id: string; name: string; amount: number; duration: number }[];
}> = ({ open, onClose, subscription, onSubmit, loading, plans }) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    user: '',
    plan: '',
    amount: 0,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    autoRenew: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (subscription) {
      setFormData({
        user: subscription.user,
        plan: subscription.plan,
        amount: subscription.amount,
        startDate: dayjs(subscription.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(subscription.endDate).format('YYYY-MM-DD'),
        autoRenew: subscription.autoRenew,
      });
    } else {
      setFormData({
        user: '',
        plan: '',
        amount: 0,
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        autoRenew: true,
      });
    }
    setErrors({});
  }, [subscription, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user.trim()) {
      newErrors.user = 'معرف المستخدم مطلوب';
    }

    if (!formData.plan.trim()) {
      newErrors.plan = 'الباقة مطلوبة';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof SubscriptionFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleSelectChange = (field: keyof SubscriptionFormData) => (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as SubscriptionFormData[typeof field]
    }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleDateChange = (field: string) => (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };

  const selectedPlan = plans.find(p => p.id === formData.plan);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {subscription ? 'تعديل اشتراك' : 'إضافة اشتراك جديد'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="معرف المستخدم"
            value={formData.user}
            onChange={handleChange('user')}
            error={!!errors.user}
            helperText={errors.user}
            fullWidth
            required
            placeholder="مثال: 507f1f77bcf86cd799439011"
          />

          <FormControl fullWidth>
            <InputLabel>الباقة</InputLabel>
            <Select
              value={formData.plan}
              onChange={handleSelectChange('plan')}
              label="الباقة"
              error={!!errors.plan}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} - {plan.amount} ر.ي ({plan.duration} أيام)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="المبلغ (ر.ي)"
            type="number"
            value={formData.amount}
            onChange={handleChange('amount')}
            error={!!errors.amount}
            helperText={errors.amount || (selectedPlan ? `السعر الأصلي: ${selectedPlan.amount} ر.ي` : '')}
            fullWidth
            required
            InputProps={{
              startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ البداية"
              value={dayjs(formData.startDate)}
              onChange={handleDateChange('startDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ الانتهاء"
              value={dayjs(formData.endDate)}
              onChange={handleDateChange('endDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel>التجديد التلقائي</InputLabel>
            <Select
              value={formData.autoRenew ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.value === 'true' }))}
              label="التجديد التلقائي"
            >
              <MenuItem value="true">نعم</MenuItem>
              <MenuItem value="false">لا</MenuItem>
            </Select>
          </FormControl>
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
          {subscription ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function SubscriptionsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Subscription | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Subscription | null>(null);
  const [renewConfirm, setRenewConfirm] = useState<Subscription | null>(null);

  const queryClient = useQueryClient();

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading, error } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => getSubscriptions(),
  });

  // Fetch subscription statistics
  const { data: stats } = useQuery({
    queryKey: ['subscriptionStats'],
    queryFn: () => getSubscriptionStats(),
  });

  // Fetch subscription plans
  const { data: plansData } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => getSubscriptionPlans(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      setDialogOpen(false);
      setEditingSubscription(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, subscription }: { id: string; subscription: Partial<SubscriptionFormData> }) =>
      updateSubscription(id, subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setDialogOpen(false);
      setEditingSubscription(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      setCancelConfirm(null);
    },
  });

  const renewMutation = useMutation({
    mutationFn: renewSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setRenewConfirm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      setDeleteConfirm(null);
    },
  });

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const handleCancel = (subscription: Subscription) => {
    setCancelConfirm(subscription);
  };

  const handleRenew = (subscription: Subscription) => {
    setRenewConfirm(subscription);
  };

  const handleDelete = (subscription: Subscription) => {
    setDeleteConfirm(subscription);
  };

  const handleFormSubmit = (formData: SubscriptionFormData) => {
    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription._id!, subscription: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const subscriptions = subscriptionsData?.subscriptions || [];
  const plans = plansData?.plans || [];

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch =
      subscription.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.plan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = !planFilter || subscription.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'cancelled': return 'ملغي';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل الاشتراكات: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة الاشتراكات
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSubscription(null);
            setDialogOpen(true);
          }}
        >
          إضافة اشتراك
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SubscriptionIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalSubscriptions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الاشتراكات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.activeSubscriptions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      اشتراكات نشطة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الإيرادات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.monthlyRecurringRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الإيرادات الشهرية المتكررة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في الاشتراكات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'cancelled' | 'expired')}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="cancelled">ملغي</MenuItem>
                <MenuItem value="expired">منتهي</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الباقة</InputLabel>
              <Select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                label="الباقة"
              >
                <MenuItem value="">الكل</MenuItem>
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip
              label={`${filteredSubscriptions.length} اشتراك`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

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
                  <TableCell>المستخدم</TableCell>
                  <TableCell>الباقة</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>تاريخ البداية</TableCell>
                  <TableCell>تاريخ الانتهاء</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>التجديد التلقائي</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription._id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {subscription.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {plans.find(p => p.id === subscription.plan)?.name || subscription.plan}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(subscription.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(subscription.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(subscription.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(subscription.status)}
                        color={getStatusColor(subscription.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subscription.autoRenew ? 'نعم' : 'لا'}
                        color={subscription.autoRenew ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {subscription.status === 'active' && (
                          <>
                            <Tooltip title="تجديد">
                              <IconButton
                                size="small"
                                onClick={() => handleRenew(subscription)}
                                color="success"
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="إلغاء">
                              <IconButton
                                size="small"
                                onClick={() => handleCancel(subscription)}
                                color="warning"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(subscription)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(subscription)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {filteredSubscriptions.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <SubscriptionIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد اشتراكات</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all' || planFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'ابدأ بإضافة اشتراك جديد'
            }
          </Typography>
        </Box>
      )}

      {/* Subscription Form Dialog */}
      <SubscriptionFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSubscription(null);
        }}
        subscription={editingSubscription}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        plans={plans}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelConfirm} onClose={() => setCancelConfirm(null)}>
        <DialogTitle>تأكيد الإلغاء</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من إلغاء اشتراك "{cancelConfirm?.plan}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirm(null)}>إلغاء</Button>
          <Button
            onClick={() => {
              if (cancelConfirm) {
                cancelMutation.mutate(cancelConfirm._id!);
              }
            }}
            color="warning"
            variant="contained"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? <CircularProgress size={16} /> : 'إلغاء الاشتراك'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renew Confirmation Dialog */}
      <Dialog open={!!renewConfirm} onClose={() => setRenewConfirm(null)}>
        <DialogTitle>تأكيد التجديد</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من تجديد اشتراك "{renewConfirm?.plan}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewConfirm(null)}>إلغاء</Button>
          <Button
            onClick={() => {
              if (renewConfirm) {
                renewMutation.mutate(renewConfirm._id!);
              }
            }}
            color="success"
            variant="contained"
            disabled={renewMutation.isPending}
          >
            {renewMutation.isPending ? <CircularProgress size={16} /> : 'تجديد الاشتراك'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف اشتراك "{deleteConfirm?.plan}"؟ لا يمكن التراجع عن هذا الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>إلغاء</Button>
          <Button
            onClick={() => {
              if (deleteConfirm) {
                deleteMutation.mutate(deleteConfirm._id!);
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
