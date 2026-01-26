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
  Description as DescriptionIcon,
  Category as KindIcon,
} from '@mui/icons-material';
import { getSanad, updateSanadStatus, deleteSanad, type SanadItem } from '../../../api/sanad';
import { SanadStatus, SanadKind, SanadStatusLabels, SanadStatusColors, SanadKindLabels } from '../../../types/sanad';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const SanadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sanad, setSanad] = useState<SanadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<SanadStatus>(SanadStatus.DRAFT);
  const [statusNotes, setStatusNotes] = useState('');

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
      loadSanad();
    }
  }, [id]);

  const loadSanad = async () => {
    try {
      setLoading(true);
      const data = await getSanad(id!);
      setSanad(data);
      // Convert string status to SanadStatus enum
      const statusMap: Record<string, SanadStatus> = {
        'draft': SanadStatus.DRAFT,
        'pending': SanadStatus.PENDING,
        'confirmed': SanadStatus.CONFIRMED,
        'completed': SanadStatus.COMPLETED,
        'cancelled': SanadStatus.CANCELLED,
      };
      setNewStatus(statusMap[data.status] || SanadStatus.DRAFT);
    } catch (error) {
      console.error('خطأ في تحميل طلب الصناد:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل طلب الصناد',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!sanad) return;

    try {
      setUpdatingStatus(true);
      await updateSanadStatus(sanad._id, { status: newStatus, notes: statusNotes });
      setSanad({ ...sanad, status: newStatus });
      setStatusDialogOpen(false);
      setStatusNotes('');
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة الطلب بنجاح',
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
    if (!sanad) return;

    try {
      await deleteSanad(sanad._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الطلب بنجاح',
        severity: 'success',
      });
      navigate('/admin/sanad');
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الطلب',
        severity: 'error',
      });
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sanad) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          لم يتم العثور على طلب الصناد
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/sanad')}
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
            <IconButton onClick={() => navigate('/admin/sanad')}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                تفاصيل طلب الصناد
              </Typography>
              <Typography variant="body2" color="text.secondary">
                طلب رقم: {sanad._id}
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
                معلومات الطلب
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {sanad.title}
                </Typography>
                {sanad.kind && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={SanadKindLabels[sanad.kind]}
                      color={
                        sanad.kind === SanadKind.EMERGENCY ? 'error' :
                        sanad.kind === SanadKind.CHARITY ? 'success' :
                        'primary'
                      }
                      icon={<KindIcon />}
                    />
                  </Box>
                )}
              </Box>

              {sanad.description && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="h6">الوصف</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {sanad.description}
                  </Typography>
                </Box>
              )}

              {Object.keys(sanad.metadata).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    بيانات إضافية
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(sanad.metadata).map(([key, value]) => (
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
                  الحالة
                </Typography>
                <Chip
                  label={SanadStatusLabels[sanad.status]}
                  color={SanadStatusColors[sanad.status]}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  آخر تحديث: {formatDate(sanad.updatedAt)}
                </Typography>
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
                      {sanad.owner?.name || 'غير محدد'}
                    </Typography>
                    {sanad.owner?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {sanad.owner.email}
                      </Typography>
                    )}
                    {sanad.owner?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {sanad.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  التواريخ
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(sanad.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      آخر تحديث
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(sanad.updatedAt)}
                    </Typography>
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
          <DialogTitle>تحديث حالة الطلب</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={newStatus}
                label="الحالة الجديدة"
                onChange={(e) => setNewStatus(e.target.value as SanadStatus)}
              >
                {Object.values(SanadStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {SanadStatusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              هل أنت متأكد من حذف طلب "{sanad.title}"؟
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

export default SanadDetailsPage;
