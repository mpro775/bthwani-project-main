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
  Label as TagIcon,
  Category as KindIcon,
} from '@mui/icons-material';
import { getMaarouf, updateMaaroufStatus, deleteMaarouf, type MaaroufItem } from '../../../api/maarouf';
import { MaaroufStatus,  MaaroufStatusLabels, MaaroufStatusColors, MaaroufKindLabels, MaaroufKindColors } from '../../../types/maarouf';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const MaaroufDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [maarouf, setMaarouf] = useState<MaaroufItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<MaaroufStatus>(MaaroufStatus.DRAFT);
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
      loadMaarouf();
    }
  }, [id]);

  const loadMaarouf = async () => {
    try {
      setLoading(true);
      const data = await getMaarouf(id!);
      setMaarouf(data);
      // Convert string status to MaaroufStatus enum
      const statusMap: Record<string, MaaroufStatus> = {
        'draft': MaaroufStatus.DRAFT,
        'pending': MaaroufStatus.PENDING,
        'confirmed': MaaroufStatus.CONFIRMED,
        'completed': MaaroufStatus.COMPLETED,
        'cancelled': MaaroufStatus.CANCELLED,
      };
      setNewStatus(statusMap[data.status] || MaaroufStatus.DRAFT);
    } catch (error) {
      console.error('خطأ في تحميل إعلان معروف:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل إعلان معروف',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!maarouf) return;

    try {
      setUpdatingStatus(true);
      await updateMaaroufStatus(maarouf._id, { status: newStatus, notes: statusNotes });
      setMaarouf({ ...maarouf, status: newStatus });
      setStatusDialogOpen(false);
      setStatusNotes('');
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة الإعلان بنجاح',
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
    if (!maarouf) return;

    try {
      await deleteMaarouf(maarouf._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الإعلان بنجاح',
        severity: 'success',
      });
      navigate('/admin/maarouf');
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الإعلان',
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

  if (!maarouf) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          لم يتم العثور على إعلان معروف
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/maarouf')}
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
            <IconButton onClick={() => navigate('/admin/maarouf')}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                تفاصيل إعلان معروف
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إعلان رقم: {maarouf._id}
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
                معلومات الإعلان
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {maarouf.title}
                </Typography>
                {maarouf.kind && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={MaaroufKindLabels[maarouf.kind]}
                      color={MaaroufKindColors[maarouf.kind]}
                      icon={<KindIcon />}
                    />
                  </Box>
                )}
              </Box>

              {maarouf.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {maarouf.description}
                  </Typography>
                </Box>
              )}

              {maarouf.tags && maarouf.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TagIcon fontSize="small" color="action" />
                    <Typography variant="h6">العلامات</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {maarouf.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {Object.keys(maarouf.metadata).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    بيانات إضافية
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(maarouf.metadata).map(([key, value]) => (
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
                  label={MaaroufStatusLabels[maarouf.status]}
                  color={MaaroufStatusColors[maarouf.status]}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  آخر تحديث: {formatDate(maarouf.updatedAt)}
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
                      {maarouf.owner?.name || 'غير محدد'}
                    </Typography>
                    {maarouf.owner?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {maarouf.owner.email}
                      </Typography>
                    )}
                    {maarouf.owner?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {maarouf.owner.phone}
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
                      {formatDate(maarouf.createdAt)}
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
                      {formatDate(maarouf.updatedAt)}
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
          <DialogTitle>تحديث حالة الإعلان</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={newStatus}
                label="الحالة الجديدة"
                onChange={(e) => setNewStatus(e.target.value as MaaroufStatus)}
              >
                {Object.values(MaaroufStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {MaaroufStatusLabels[status]}
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
              هل أنت متأكد من حذف إعلان "{maarouf.title}"؟
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

export default MaaroufDetailsPage;
