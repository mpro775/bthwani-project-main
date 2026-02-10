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
  LocationOn as LocationIcon,
  Bloodtype as BloodIcon,
} from '@mui/icons-material';
import { getEs3afni, updateEs3afniStatus, deleteEs3afni, type Es3afniItem as ApiEs3afniItem } from '../../../api/es3afni';
import { Es3afniStatus, Es3afniStatusLabels, Es3afniStatusColors, URGENCY_LABELS, type Es3afniItem, type Es3afniUrgency } from '../../../types/es3afni';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const Es3afniDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [es3afni, setEs3afni] = useState<Es3afniItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    newStatus: Es3afniStatus | '';
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

  // جلب بيانات البلاغ
  const fetchEs3afni = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data: ApiEs3afniItem = await getEs3afni(id);
      // Convert string status to Es3afniStatus enum
      const statusMap: Record<string, Es3afniStatus> = {
        'draft': Es3afniStatus.DRAFT,
        'pending': Es3afniStatus.PENDING,
        'confirmed': Es3afniStatus.CONFIRMED,
        'completed': Es3afniStatus.COMPLETED,
        'cancelled': Es3afniStatus.CANCELLED,
        'expired': Es3afniStatus.EXPIRED,
      };
      const convertedData: Es3afniItem = {
        ...data,
        status: statusMap[data.status] || Es3afniStatus.DRAFT,
      };
      setEs3afni(convertedData);
    } catch (error) {
      console.error('خطأ في جلب بيانات البلاغ:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل بيانات البلاغ',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEs3afni();
  }, [id]);

  // تحديث الحالة
  const handleStatusUpdate = async () => {
    if (!es3afni || !statusDialog.newStatus) return;

    try {
      setUpdating(true);
      await updateEs3afniStatus(es3afni._id, statusDialog.newStatus);
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة البلاغ بنجاح',
        severity: 'success',
      });
      setStatusDialog({ open: false, newStatus: '' });
      fetchEs3afni(); // إعادة جلب البيانات
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحديث حالة البلاغ',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  // حذف البلاغ
  const handleDelete = async () => {
    if (!es3afni) return;

    try {
      setUpdating(true);
      await deleteEs3afni(es3afni._id);
      setSnackbar({
        open: true,
        message: 'تم حذف البلاغ بنجاح',
        severity: 'success',
      });
      navigate('/admin/es3afni');
    } catch (error) {
      console.error('خطأ في حذف البلاغ:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف البلاغ',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
      setDeleteDialog(false);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: Es3afniStatus) => {
    return Es3afniStatusColors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!es3afni) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          لم يتم العثور على البلاغ المطلوب
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
              navigate('/admin/es3afni');
            }}
          >
            إسعفني
          </Link>
          <Typography color="text.primary">تفاصيل البلاغ</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/es3afni')}
              variant="outlined"
            >
              العودة
            </Button>
            <Box>
              <Typography variant="h4" gutterBottom>
                {es3afni.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                معرف البلاغ: {es3afni._id}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setStatusDialog({ open: true, newStatus: es3afni.status })}
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

        {/* Status & Urgency */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip
            label={Es3afniStatusLabels[es3afni.status]}
            size="medium"
            color={getStatusColor(es3afni.status)}
            variant="outlined"
          />
          {es3afni.urgency && (
            <Chip
              label={URGENCY_LABELS[es3afni.urgency as Es3afniUrgency] || es3afni.urgency}
              size="medium"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid  size={{xs: 12, md: 8}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات البلاغ
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
                      معرف المستخدم: {es3afni.ownerId}
                    </Typography>
                  </Grid>

                  {es3afni.description && (
                    <Grid  size={{xs: 12}}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        التفاصيل
                      </Typography>
                      <Typography variant="body1">
                        {es3afni.description}
                      </Typography>
                    </Grid>
                  )}

                  {es3afni.bloodType && (
                    <Grid  size={{xs: 12, sm: 6}}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BloodIcon color="error" />
                        <Typography variant="body2" color="text.secondary">
                          فصيلة الدم المطلوبة
                        </Typography>
                      </Box>
                      <Chip
                        label={es3afni.bloodType}
                        size="medium"
                        color="error"
                        variant="outlined"
                        sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                      />
                    </Grid>
                  )}

                  {es3afni.location && (
                    <Grid  size={{xs: 12, sm: 6}}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                          الموقع
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {es3afni.location.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {es3afni.location.lat}, {es3afni.location.lng}
                      </Typography>
                    </Grid>
                  )}

                  {/* Metadata */}
                  {es3afni.metadata && Object.keys(es3afni.metadata).length > 0 && (
                    <Grid  size={{xs: 12}}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        معلومات إضافية
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <pre style={{ fontSize: '0.875rem', margin: 0 }}>
                          {JSON.stringify(es3afni.metadata, null, 2)}
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
                      {new Date(es3afni.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  {es3afni.expiresAt && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ينتهي الصلاحية
                      </Typography>
                      <Typography variant="body2" color={es3afni.status === Es3afniStatus.EXPIRED ? 'text.secondary' : 'warning.main'}>
                        {new Date(es3afni.expiresAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {es3afni.status === Es3afniStatus.EXPIRED && ' (منتهي)'}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      آخر تحديث
                    </Typography>
                    <Typography variant="body2">
                      {new Date(es3afni.updatedAt).toLocaleDateString('ar-SA', {
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
          <DialogTitle>تحديث حالة البلاغ</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={statusDialog.newStatus}
                onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value as Es3afniStatus })}
                label="الحالة الجديدة"
              >
                {Object.values(Es3afniStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {Es3afniStatusLabels[status]}
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
              هل أنت متأكد من حذف البلاغ "{es3afni.title}"؟
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

export default Es3afniDetailsPage;
