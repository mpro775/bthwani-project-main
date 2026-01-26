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
  LocalOffer as CouponIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { SelectChangeEvent } from '@mui/material/Select';

import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
  generateCouponCodes,
  type CouponFormData
} from '../../api/coupons';
import { type Coupon } from '../../api/wallet';

const CouponFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSubmit: (data: CouponFormData) => void;
  loading: boolean;
}> = ({ open, onClose, coupon, onSubmit, loading }) => {
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'fixed',
    value: 0,
    expiryDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        type: coupon.type || 'fixed',
        value: coupon.value || 0,
        expiryDate: dayjs(coupon.expiryDate).format('YYYY-MM-DD'),
      });
    } else {
      setFormData({
        code: '',
        type: 'fixed',
        value: 0,
        expiryDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      });
    }
    setErrors({});
  }, [coupon, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'كود الكوبون مطلوب';
    }

    if (formData.value <= 0) {
      newErrors.value = 'قيمة الكوبون يجب أن تكون أكبر من صفر';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'تاريخ الانتهاء مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CouponFormData | 'prefix' | 'count' | 'expiryDays' | 'usageLimit') => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      expiryDate: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };

  const handleSelectChange = (field: keyof CouponFormData) => (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as CouponFormData[typeof field]
    }));
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {coupon ? 'تعديل كوبون' : 'إضافة كوبون جديد'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="كود الكوبون"
              value={formData.code}
              onChange={handleChange('code')}
              error={!!errors.code}
              helperText={errors.code}
              fullWidth
              required
              inputProps={{ style: { fontFamily: 'monospace', textTransform: 'uppercase' } }}
            />
            <Button
              variant="outlined"
              onClick={generateRandomCode}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <CodeIcon />
            </Button>
          </Box>

          <FormControl fullWidth>
            <InputLabel>نوع الكوبون</InputLabel>
            <Select
              value={formData.type}
              onChange={handleSelectChange('type')}
              label="نوع الكوبون"
            >
              <MenuItem value="fixed">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon fontSize="small" />
                  مبلغ ثابت
                </Box>
              </MenuItem>
              <MenuItem value="percentage">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PercentIcon fontSize="small" />
                  نسبة مئوية
                </Box>
              </MenuItem>
              <MenuItem value="free_shipping">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShippingIcon fontSize="small" />
                  شحن مجاني
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={formData.type === 'percentage' ? 'النسبة (%)' : 'المبلغ (ر.ي)'}
            type="number"
            value={formData.value}
            onChange={handleChange('value')}
            error={!!errors.value}
            helperText={errors.value}
            fullWidth
            required
            InputProps={{
              startAdornment: formData.type === 'percentage' ? <PercentIcon /> : <MoneyIcon />,
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ الانتهاء"
              value={dayjs(formData.expiryDate)}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!errors.expiryDate,
                  helperText: errors.expiryDate,
                },
              }}
            />
          </LocalizationProvider>
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
          {coupon ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GenerateCouponsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    count: number;
    prefix: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    expiryDays: number;
    usageLimit: number;
  }) => void;
  loading: boolean;
}> = ({ open, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    count: 10,
    prefix: '',
    type: 'fixed' as "percentage" | "fixed" | "free_shipping",
    value: 0,
    expiryDays: 30,
    usageLimit: 1,
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTypeSelect = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      type: event.target.value as "percentage" | "fixed" | "free_shipping",
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        إنشاء كوبونات متعددة
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="عدد الكوبونات"
            type="number"
            value={formData.count}
            onChange={handleChange('count')}
            fullWidth
            InputProps={{ inputProps: { min: 1, max: 100 } }}
          />

          <TextField
            label="بادئة الكود (اختياري)"
            value={formData.prefix}
            onChange={handleChange('prefix')}
            fullWidth
            placeholder="مثال: SALE, NEWUSER..."
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />

          <FormControl fullWidth>
            <InputLabel>نوع الكوبون</InputLabel>
            <Select
              value={formData.type}
              onChange={handleTypeSelect}
              label="نوع الكوبون"
            >
              <MenuItem value="fixed">مبلغ ثابت</MenuItem>
              <MenuItem value="percentage">نسبة مئوية</MenuItem>
              <MenuItem value="free_shipping">شحن مجاني</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={formData.type === 'percentage' ? 'النسبة (%)' : 'المبلغ (ر.ي)'}
            type="number"
            value={formData.value}
            onChange={handleChange('value')}
            fullWidth
            required
          />

          <TextField
            label="مدة الصلاحية (بالأيام)"
            type="number"
            value={formData.expiryDays}
            onChange={handleChange('expiryDays')}
            fullWidth
            InputProps={{ inputProps: { min: 1, max: 365 } }}
          />

          <TextField
            label="حد الاستخدام لكل كوبون"
            type="number"
            value={formData.usageLimit}
            onChange={handleChange('usageLimit')}
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />
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
          إنشاء الكوبونات
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CouponsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Coupon | null>(null);

  const queryClient = useQueryClient();

  // Fetch coupons
  const { data: couponsData, isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => getCoupons(),
  });

  // Fetch coupon statistics
  const { data: stats } = useQuery({
    queryKey: ['couponStats'],
    queryFn: getCouponStats,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
      setDialogOpen(false);
      setEditingCoupon(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, coupon }: { id: string; coupon: Partial<CouponFormData> }) =>
      updateCoupon(id, coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setDialogOpen(false);
      setEditingCoupon(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
      setDeleteConfirm(null);
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateCouponCodes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
      setGenerateDialogOpen(false);
    },
  });

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  const handleDelete = (coupon: Coupon) => {
    setDeleteConfirm(coupon);
  };

  const handleFormSubmit = (formData: CouponFormData) => {
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id!, coupon: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleGenerateSubmit = (generateData: {
    count: number;
    prefix: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    expiryDays: number;
    usageLimit: number;
  }) => {
    generateMutation.mutate(generateData);
  };

  const coupons = couponsData?.coupons || [];

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.assignedTo && coupon.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

    const isExpired = dayjs(coupon.expiryDate).isBefore(dayjs());
    const isActive = !coupon.isUsed && !isExpired;
    const isUsed = coupon.isUsed;
    const isExpiredStatus = isExpired && !coupon.isUsed;

    let matchesStatus = true;
    switch (statusFilter) {
      case 'active':
        matchesStatus = isActive;
        break;
      case 'used':
        matchesStatus = isUsed;
        break;
      case 'expired':
        matchesStatus = isExpiredStatus;
        break;
    }

    const matchesType = !typeFilter || coupon.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <PercentIcon />;
      case 'fixed': return <MoneyIcon />;
      case 'free_shipping': return <ShippingIcon />;
      default: return <CouponIcon />;
    }
  };



  const getStatusColor = (coupon: Coupon) => {
    const isExpired = dayjs(coupon.expiryDate).isBefore(dayjs());
    if (coupon.isUsed) return 'error';
    if (isExpired) return 'warning';
    return 'success';
  };

  const getStatusText = (coupon: Coupon) => {
    const isExpired = dayjs(coupon.expiryDate).isBefore(dayjs());
    if (coupon.isUsed) return 'مُستخدم';
    if (isExpired) return 'منتهي الصلاحية';
    return 'نشط';
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return `${value} ر.ي`;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل الكوبونات: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة الكوبونات
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            إنشاء متعدد
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCoupon(null);
              setDialogOpen(true);
            }}
          >
            إضافة كوبون
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CouponIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalCoupons}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الكوبونات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}   >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PercentIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.activeCoupons}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      كوبونات نشطة
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
                  <MoneyIcon color="error" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.usedCoupons}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      كوبونات مُستخدمة
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
                      {stats.totalUsage}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الاستخدام
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
              placeholder="البحث في الكوبونات..."
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
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "used" | "expired")}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="used">مُستخدم</MenuItem>
                <MenuItem value="expired">منتهي الصلاحية</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>النوع</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="النوع"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                <MenuItem value="percentage">نسبة مئوية</MenuItem>
                <MenuItem value="free_shipping">شحن مجاني</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredCoupons.length} كوبون`}
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
                  <TableCell>الكود</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>القيمة</TableCell>
                  <TableCell>تاريخ الانتهاء</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الاستخدام</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {coupon.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(coupon.type)}
                        <Typography variant="body2">
                          {coupon.type === 'percentage' ? 'نسبة مئوية' :
                           coupon.type === 'fixed' ? 'مبلغ ثابت' : 'شحن مجاني'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatValue(coupon.value, coupon.type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(coupon.expiryDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(coupon)}
                        color={getStatusColor(coupon)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(coupon)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(coupon)}
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

      {filteredCoupons.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <CouponIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد كوبونات</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all' || typeFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'ابدأ بإضافة كوبون جديد'
            }
          </Typography>
        </Box>
      )}

      {/* Coupon Form Dialog */}
      <CouponFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingCoupon(null);
        }}
        coupon={editingCoupon}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Generate Coupons Dialog */}
      <GenerateCouponsDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onSubmit={handleGenerateSubmit}
        loading={generateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الكوبون "{deleteConfirm?.code}"؟
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
