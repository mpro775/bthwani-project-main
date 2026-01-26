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
  Visibility as ViewIcon,
  Category as KindIcon,
} from '@mui/icons-material';
import { getSanadList, updateSanadStatus, deleteSanad, type SanadItem } from '../../../api/sanad';
import { SanadStatus, SanadKind, SanadStatusLabels, SanadStatusColors, SanadKindLabels } from '../../../types/sanad';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const SanadListPage: React.FC = () => {
  const navigate = useNavigate();
  const [sanadItems, setSanadItems] = useState<SanadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SanadStatus | ''>('');
  const [kindFilter, setKindFilter] = useState<SanadKind | ''>('');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SanadItem | null>(null);

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

  const loadSanadItems = useCallback(async (loadMore = false) => {
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
        if (kindFilter) params.kind = kindFilter;
      } else if (nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await getSanadList(params);

      if (loadMore) {
        setSanadItems(prev => [...prev, ...response.items]);
      } else {
        setSanadItems(response.items);
      }

      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('خطأ في تحميل طلبات الصناد:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل طلبات الصناد',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, statusFilter, kindFilter, nextCursor]);

  useEffect(() => {
    loadSanadItems();
  }, [loadSanadItems]);

  const handleStatusUpdate = async (id: string, newStatus: SanadStatus) => {
    try {
      setUpdatingStatus(id);
      await updateSanadStatus(id, { status: newStatus });
      setSnackbar({
        open: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        severity: 'success',
      });
      // Reload the list
      loadSanadItems();
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
      await deleteSanad(itemToDelete._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الطلب بنجاح',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadSanadItems();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الطلب',
        severity: 'error',
      });
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/sanad/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <RequireAdminPermission>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            إدارة طلبات الصناد
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/sanad/new')}
          >
            إضافة طلب جديد
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
              <Grid  size={{xs: 12, sm: 6, md: 4}}>
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
                placeholder="ابحث في العناوين والأوصاف..."
              />
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  label="الحالة"
                  onChange={(e) => setStatusFilter(e.target.value as SanadStatus)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(SanadStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {SanadStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <FormControl fullWidth>
                <InputLabel>النوع</InputLabel>
                <Select
                  value={kindFilter}
                  label="النوع"
                  onChange={(e) => setKindFilter(e.target.value as SanadKind)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(SanadKind).map((kind) => (
                    <MenuItem key={kind} value={kind}>
                      {SanadKindLabels[kind]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 1}}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => loadSanadItems()}
                  disabled={loading}
                >
                  فلترة
                </Button>
              </Stack>
            </Grid>
            <Grid  size={{xs: 12, sm: 6, md: 1}}>
              <Button
                variant="text"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setKindFilter('');
                  loadSanadItems();
                }}
              >
                إعادة تعيين
              </Button>
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
                <TableCell>المالك</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sanadItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لا توجد طلبات صناد
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sanadItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {item.kind && (
                        <Chip
                          label={SanadKindLabels[item.kind]}
                          color={
                            item.kind === SanadKind.EMERGENCY ? 'error' :
                            item.kind === SanadKind.CHARITY ? 'success' :
                            'primary'
                          }
                          size="small"
                          icon={<KindIcon />}
                        />
                      )}
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
                          onChange={(e) => handleStatusUpdate(item._id, e.target.value as SanadStatus)}
                          disabled={updatingStatus === item._id}
                        >
                          {Object.values(SanadStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              <Chip
                                label={SanadStatusLabels[status]}
                                color={SanadStatusColors[status]}
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
              onClick={() => loadSanadItems(true)}
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
              هل أنت متأكد من حذف طلب "{itemToDelete?.title}"؟
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

export default SanadListPage;
