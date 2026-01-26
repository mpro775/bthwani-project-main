import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  Wallet as WalletIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { getPayment, updatePaymentsStatus, deletePayment, type PaymentsItem } from '../../../api/payments';
import { PaymentStatus, PaymentType, PaymentMethod, PaymentStatusLabels, PaymentStatusColors, PaymentTypeLabels, PaymentMethodLabels } from '../../../types/payments';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const PaymentsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [statusNotes, setStatusNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const data = await getPayment(id!);
      setPayment(data);
      setNewStatus(data.status as PaymentStatus);
      setTransactionId(data.transactionId || '');
    } catch (error) {
      console.error('خطأ في تحميل الدفع:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل الدفع',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!payment) return;

    try {
      setUpdatingStatus(true);
      await updatePaymentsStatus(payment._id, {
        status: newStatus,
        notes: statusNotes,
        transactionId: transactionId || undefined
      });
      setPayment({ ...payment, status: newStatus, transactionId: transactionId || payment.transactionId });
      setStatusDialogOpen(false);
      setStatusNotes('');
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة الدفع بنجاح',
        severity: 'success',
      });
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحديث الحالة',
        severity: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!payment) return;

    try {
      await deletePayment(payment._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الدفع بنجاح',
        severity: 'success',
      });
      navigate('/admin/payments');
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الدفع',
        severity: 'error',
      });
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CARD:
        return <CardIcon fontSize="large" />;
      case PaymentMethod.BANK_TRANSFER:
        return <BankIcon fontSize="large" />;
      case PaymentMethod.WALLET:
        return <WalletIcon fontSize="large" />;
      default:
        return <MoneyIcon fontSize="large" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          لم يتم العثور على الدفع
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/payments')}
          sx={{ mt: 2 }}
        >
          العودة للقائمة
        </Button>
      </Box>
    );
  }

  return (
    <RequireAdminPermission>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/payments')}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                تفاصيل الدفع
              </Typography>
              <Typography variant="body2" color="text.secondary">
                دفع رقم: {payment._id}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setStatusDialogOpen(true)}
            >
              تحديث الحالة
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              حذف
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid  size={{xs: 12, lg: 8}}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                معلومات الدفع
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {payment.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={PaymentTypeLabels[payment.type]}
                    color={
                      payment.type === PaymentType.DEPOSIT ? 'success' :
                      payment.type === PaymentType.WITHDRAWAL ? 'error' :
                      payment.type === PaymentType.PAYMENT ? 'secondary' :
                      payment.type === PaymentType.REFUND ? 'warning' :
                      payment.type === PaymentType.COMMISSION ? 'info' :
                      'primary'
                    }
                  />
                  <Chip
                    label={PaymentStatusLabels[payment.status]}
                    color={PaymentStatusColors[payment.status]}
                  />
                </Box>
              </Box>

              {payment.description && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="h6">الوصف</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {payment.description}
                  </Typography>
                </Box>
              )}

              {/* Payment Amount */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MoneyIcon fontSize="small" color="action" />
                  <Typography variant="h6">المبلغ</Typography>
                </Box>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {formatCurrency(payment.amount, payment.currency)}
                </Typography>
              </Box>

              {/* Payment Method */}
              <Box sx={{ mb: 3 }}>
       
                <Typography variant="h6" gutterBottom>
                  طريقة الدفع
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getMethodIcon(payment.method as PaymentMethod)}
                  <Typography variant="h5">
                    {PaymentMethodLabels[payment.method as PaymentMethod]}
                  </Typography>
                </Box>
              </Box>

              {/* Transaction Details */}
              {(payment.reference || payment.transactionId) && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ReceiptIcon fontSize="small" color="action" />
                    <Typography variant="h6">تفاصيل المعاملة</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {payment.reference && (
                      <Grid  size={{xs: 12, sm: 6}}>
                        <Typography variant="body2" color="text.secondary">
                          رقم المرجع
                        </Typography>
                        <Typography variant="body1" fontFamily="monospace">
                          {payment.reference}
                        </Typography>
                      </Grid>
                    )}
                    {payment.transactionId && (
                        <Grid  size={{xs: 12, sm: 6}}>
                        <Typography variant="body2" color="text.secondary">
                          رقم المعاملة
                        </Typography>
                        <Typography variant="body1" fontFamily="monospace">
                          {payment.transactionId}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {Object.keys(payment.metadata).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    بيانات إضافية
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(payment.metadata).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid  size={{xs: 12, lg: 4}}>
            {/* Status Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الحالة والتواريخ
                </Typography>
                <Chip
                  label={PaymentStatusLabels[payment.status]}
                  color={PaymentStatusColors[payment.status]}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(payment.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      آخر تحديث
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(payment.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
                {payment.processedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        تاريخ المعالجة
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(payment.processedAt)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {payment.completedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        تاريخ الإكمال
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(payment.completedAt)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات المالك
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {payment.owner?.name || 'غير محدد'}
                    </Typography>
                    {payment.owner?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {payment.owner.email}
                      </Typography>
                    )}
                    {payment.owner?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {payment.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Update Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>تحديث حالة الدفع</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={newStatus}
                label="الحالة الجديدة"
                onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}
              >
                {Object.values(PaymentStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {PaymentStatusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="رقم المعاملة (اختياري)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="TXN-123456789"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="ملاحظات (اختياري)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="أضف ملاحظات حول سبب التغيير..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={updatingStatus}
              startIcon={updatingStatus ? <CircularProgress size={16} /> : null}
            >
              {updatingStatus ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <Typography>
              هل أنت متأكد من حذف دفع "{payment.title}"؟
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

export default PaymentsDetailsPage;
