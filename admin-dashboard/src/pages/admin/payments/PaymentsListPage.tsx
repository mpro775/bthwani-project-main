import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,

  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  Wallet as WalletIcon,
} from '@mui/icons-material';
import { getPaymentsList, updatePaymentsStatus, deletePayment, type PaymentsItem } from '../../../api/payments';
import { PaymentStatus, PaymentType, PaymentMethod, PaymentStatusLabels, PaymentStatusColors, PaymentTypeLabels, PaymentMethodLabels } from '../../../types/payments';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const PaymentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [paymentsItems, setPaymentsItems] = useState<PaymentsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PaymentType | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [amountMinFilter, setAmountMinFilter] = useState('');
  const [amountMaxFilter, setAmountMaxFilter] = useState('');
  const [referenceFilter, setReferenceFilter] = useState('');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PaymentsItem | null>(null);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadPaymentsItems = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params: any = {
        limit: 25,
      };

      if (!loadMore) {
        // Only add filters for initial load
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (typeFilter) params.type = typeFilter;
        if (methodFilter) params.method = methodFilter;
        if (amountMinFilter) params.amountMin = parseFloat(amountMinFilter);
        if (amountMaxFilter) params.amountMax = parseFloat(amountMaxFilter);
        if (referenceFilter) params.reference = referenceFilter;
      } else if (nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await getPaymentsList(params);

      if (loadMore) {
        setPaymentsItems(prev => [...prev, ...response.items]);
      } else {
        setPaymentsItems(response.items);
      }

      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('خطأ في تحميل المدفوعات:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل المدفوعات',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, statusFilter, typeFilter, methodFilter, amountMinFilter, amountMaxFilter, referenceFilter, nextCursor]);

  useEffect(() => {
    loadPaymentsItems();
  }, [loadPaymentsItems]);

  const handleStatusUpdate = async (id: string, newStatus: PaymentStatus) => {
    try {
      setUpdatingStatus(id);
      await updatePaymentsStatus(id, { status: newStatus });
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة الدفع بنجاح',
        severity: 'success',
      });
      // Reload the list
      loadPaymentsItems();
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحديث الحالة',
        severity: 'error',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deletePayment(itemToDelete._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الدفع بنجاح',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadPaymentsItems();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الدفع',
        severity: 'error',
      });
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/payments/${id}`);
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CARD:
        return <CardIcon />;
      case PaymentMethod.BANK_TRANSFER:
        return <BankIcon />;
      case PaymentMethod.WALLET:
        return <WalletIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  return (
    <RequireAdminPermission>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            إدارة المدفوعات
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/payments/new')}
          >
            إضافة دفع جديد
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid  size={{xs: 12, sm: 6, md: 2}}>
              <TextField
                fullWidth
                label="البحث"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="ابحث في العناوين..."
              />
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  label="الحالة"
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(PaymentStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {PaymentStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>النوع</InputLabel>
                <Select
                  value={typeFilter}
                  label="النوع"
                  onChange={(e) => setTypeFilter(e.target.value as PaymentType)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(PaymentType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {PaymentTypeLabels[type]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>طريقة الدفع</InputLabel>
                <Select
                  value={methodFilter}
                  label="طريقة الدفع"
                  onChange={(e) => setMethodFilter(e.target.value as PaymentMethod)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(PaymentMethod).map((method) => (
                    <MenuItem key={method} value={method}>
                      {PaymentMethodLabels[method]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 1}}>
              <TextField
                fullWidth
                label="من"
                type="number"
                value={amountMinFilter}
                onChange={(e) => setAmountMinFilter(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">ر.س</InputAdornment>,
                }}
              />
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 1}}>
              <TextField
                fullWidth
                label="إلى"
                type="number"
                value={amountMaxFilter}
                onChange={(e) => setAmountMaxFilter(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">ر.س</InputAdornment>,
                }}
              />
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 2}}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => loadPaymentsItems()}
                  disabled={loading}
                >
                  فلترة
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setTypeFilter('');
                    setMethodFilter('');
                    setAmountMinFilter('');
                    setAmountMaxFilter('');
                    setReferenceFilter('');
                    loadPaymentsItems();
                  }}
                >
                  إعادة تعيين
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>العنوان</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>طريقة الدفع</TableCell>
                <TableCell>المالك</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paymentsItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لا توجد مدفوعات
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paymentsItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        {item.reference && (
                          <Typography variant="body2" color="text.secondary">
                            {item.reference}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PaymentTypeLabels[item.type]}
                        color={
                          item.type === PaymentType.DEPOSIT ? 'success' :
                          item.type === PaymentType.WITHDRAWAL ? 'error' :
                          item.type === PaymentType.PAYMENT ? 'secondary' :
                          item.type === PaymentType.REFUND ? 'warning' :
                          item.type === PaymentType.COMMISSION ? 'info' :
                          'primary'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(item.amount, item.currency)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getMethodIcon(item.method as PaymentMethod)}
                        <Typography variant="body2">
                          {PaymentMethodLabels[item.method as PaymentMethod]}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">
                            {item.owner?.name || 'غير محدد'}
                          </Typography>
                          {item.owner?.email && (
                            <Typography variant="caption" color="text.secondary">
                              {item.owner.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item._id, e.target.value as PaymentStatus)}
                          disabled={updatingStatus === item._id}
                        >
                          {Object.values(PaymentStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              <Chip
                                label={PaymentStatusLabels[status]}
                                color={PaymentStatusColors[status]}
                                size="small"
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(item._id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Load More */}
        {nextCursor && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => loadPaymentsItems(true)}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={16} /> : null}
            >
              {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
            </Button>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <Typography>
              هل أنت متأكد من حذف دفع "{itemToDelete?.title}"؟
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              هذا الإجراء لا يمكن التراجع عنه.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              حذف
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default PaymentsListPage;
