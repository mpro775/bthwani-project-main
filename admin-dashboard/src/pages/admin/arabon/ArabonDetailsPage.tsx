import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { getArabon, updateArabonStatus, deleteArabon, type ArabonItem as ApiArabonItem } from '../../../api/arabon';
import { ArabonStatus, ArabonStatusLabels, ArabonStatusColors, type ArabonItem } from '../../../types/arabon';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const ArabonDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [arabon, setArabon] = useState<ArabonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    newStatus: ArabonStatus | '';
  }>({
    open: false,
    newStatus: '',
  });

  const [deleteDialog, setDeleteDialog] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // جلب بيانات الطلب
  const fetchArabon = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data: ApiArabonItem = await getArabon(id);
      // Convert string status to ArabonStatus enum
      const statusMap: Record<string, ArabonStatus> = {
        'draft': ArabonStatus.DRAFT,
        'pending': ArabonStatus.PENDING,
        'confirmed': ArabonStatus.CONFIRMED,
        'completed': ArabonStatus.COMPLETED,
        'cancelled': ArabonStatus.CANCELLED,
      };
      const convertedData: ArabonItem = {
        ...data,
        status: statusMap[data.status] || ArabonStatus.DRAFT,
      };
      setArabon(convertedData);
    } catch (error) {
      console.error('خطأ في جلب بيانات الطلب:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل بيانات الطلب',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArabon();
  }, [id]);

  // تحديث الحالة
  const handleStatusUpdate = async () => {
    if (!arabon || !statusDialog.newStatus) return;

    try {
      setUpdating(true);
      await updateArabonStatus(arabon._id, statusDialog.newStatus);
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        severity: 'success',
      });
      setStatusDialog({ open: false, newStatus: '' });
      fetchArabon(); // إعادة جلب البيانات
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحديث حالة الطلب',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  // حذف الطلب
  const handleDelete = async () => {
    if (!arabon) return;

    try {
      setUpdating(true);
      await deleteArabon(arabon._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الطلب بنجاح',
        severity: 'success',
      });
      navigate('/admin/arabon');
    } catch (error) {
      console.error('خطأ في حذف الطلب:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الطلب',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
      setDeleteDialog(false);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: ArabonStatus) => {
    return ArabonStatusColors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!arabon) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          لم يتم العثور على الطلب المطلوب
        </Alert>
      </Box>
    );
  }

  return (
    <RequireAdminPermission permission="read">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/arabon');
            }}
          >
            العربون
          </Link>
          <Typography color="text.primary">تفاصيل الطلب</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/arabon')}
              variant="outlined"
            >
              العودة
            </Button>
            <Box>
              <Typography variant="h4" gutterBottom>
                {arabon.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                معرف الطلب: {arabon._id}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setStatusDialog({ open: true, newStatus: arabon.status })}
            >
              تحديث الحالة
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialog(true)}
            >
              حذف
            </Button>
          </Box>
        </Box>

        {/* Status Chip */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={ArabonStatusLabels[arabon.status]}
            size="medium"
            color={getStatusColor(arabon.status)}
            variant="outlined"
          />
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid  size={{xs: 12, md: 8}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات الطلب
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid  size={{xs: 12}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        المالك
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      معرف المستخدم: {arabon.ownerId}
                    </Typography>
                  </Grid>

                  {arabon.description && (
                    <Grid  size={{xs: 12}}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        الوصف
                      </Typography>
                      <Typography variant="body1">
                        {arabon.description}
                      </Typography>
                    </Grid>
                  )}

                  {arabon.depositAmount && (
                    <Grid  size={{xs: 12, sm: 6}}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MoneyIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                          قيمة العربون
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium" color="primary">
                        {arabon.depositAmount} ريال
                      </Typography>
                    </Grid>
                  )}

                  {arabon.scheduleAt && (
                    <Grid  size={{xs: 12, sm: 6}}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EventIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                          موعد التنفيذ
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {new Date(arabon.scheduleAt).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Grid>
                  )}

                  {/* Metadata */}
                  {arabon.metadata && Object.keys(arabon.metadata).length > 0 && (
                    <Grid  size={{xs: 12}}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        بيانات إضافية
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <pre style={{ fontSize: '0.875rem', margin: 0 }}>
                          {JSON.stringify(arabon.metadata, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Timestamps */}
            <Grid  size={{xs: 12, md: 4}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  التواريخ
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        تاريخ الإنشاء
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {new Date(arabon.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      آخر تحديث
                    </Typography>
                    <Typography variant="body2">
                      {new Date(arabon.updatedAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Update Dialog */}
        <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, newStatus: '' })}>
          <DialogTitle>تحديث حالة الطلب</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={statusDialog.newStatus}
                onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value as ArabonStatus })}
                label="الحالة الجديدة"
              >
                {Object.values(ArabonStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {ArabonStatusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog({ open: false, newStatus: '' })}>
              إلغاء
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={updating || !statusDialog.newStatus}
            >
              {updating ? <CircularProgress size={16} /> : 'تحديث'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <Typography>
              هل أنت متأكد من حذف الطلب "{arabon.title}"؟
            </Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              هذا الإجراء لا يمكن التراجع عنه
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={updating}
            >
              {updating ? <CircularProgress size={16} /> : 'حذف'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default ArabonDetailsPage;
