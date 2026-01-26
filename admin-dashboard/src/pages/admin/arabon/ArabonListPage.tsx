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
 
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { getArabonList, updateArabonStatus, deleteArabon, type ArabonItem as ApiArabonItem } from '../../../api/arabon';
import { ArabonStatus, ArabonStatusLabels, ArabonStatusColors, type ArabonItem } from '../../../types/arabon';
import RequireAdminPermission from '../../../components/RequireAdminPermission';

const ArabonListPage: React.FC = () => {
  const navigate = useNavigate();
  const [arabonItems, setArabonItems] = useState<ArabonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    arabon: ArabonItem | null;
    action: 'update_status' | 'delete';
    newStatus?: ArabonStatus;
  }>({
    open: false,
    arabon: null,
    action: 'update_status',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // جلب قائمة العربون
  const fetchArabonItems = useCallback(async (cursor?: string, append: boolean = false) => {
    try {
      setLoading(true);
      const params: any = { limit: 25 };
      if (cursor) params.cursor = cursor;

      const response = await getArabonList(params);
      const apiItems: ApiArabonItem[] = response.items || [];
      
      // Convert string status to ArabonStatus enum
      const statusMap: Record<string, ArabonStatus> = {
        'draft': ArabonStatus.DRAFT,
        'pending': ArabonStatus.PENDING,
        'confirmed': ArabonStatus.CONFIRMED,
        'completed': ArabonStatus.COMPLETED,
        'cancelled': ArabonStatus.CANCELLED,
      };
      
      const newItems: ArabonItem[] = apiItems.map((item: ApiArabonItem): ArabonItem => {
        const converted: ArabonItem = {
          ...item,
          status: statusMap[item.status] || ArabonStatus.DRAFT,
        };
        return converted;
      });

      setArabonItems((prev: ArabonItem[]) => {
        if (append) {
          return [...prev, ...newItems];
        }
        return newItems;
      });
      setNextCursor(response.nextCursor || null);
      setHasMore(!!response.nextCursor && newItems.length === 25);
    } catch (error) {
      console.error('خطأ في جلب قائمة العربون:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل قائمة العربون',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArabonItems();
  }, [fetchArabonItems]);

  // تحديث حالة الطلب
  const handleStatusUpdate = async (arabon: ArabonItem, newStatus: ArabonStatus) => {
    try {
      await updateArabonStatus(arabon._id, newStatus as string);
      setSnackbar({
        open: true,
        message: `تم تحديث حالة الطلب بنجاح`,
        severity: 'success',
      });
      fetchArabonItems();
    } catch (error) {
      console.error('خطأ في تحديث حالة الطلب:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحديث حالة الطلب',
        severity: 'error',
      });
    }
  };

  // حذف الطلب
  const handleDeleteArabon = async (arabon: ArabonItem) => {
    try {
      await deleteArabon(arabon._id);
      setSnackbar({
        open: true,
        message: 'تم حذف الطلب بنجاح',
        severity: 'success',
      });
      fetchArabonItems();
    } catch (error) {
      console.error('خطأ في حذف الطلب:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حذف الطلب',
        severity: 'error',
      });
    }
  };

  // فتح نافذة التأكيد
  const openConfirmDialog = (arabon: ArabonItem, action: 'update_status' | 'delete', newStatus?: ArabonStatus) => {
    setConfirmDialog({ open: true, arabon, action, newStatus });
  };

  // إغلاق نافذة التأكيد
  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, arabon: null, action: 'update_status' });
  };

  // تأكيد العملية
  const confirmAction = async () => {
    if (!confirmDialog.arabon) return;

    const { arabon, action, newStatus } = confirmDialog;

    switch (action) {
      case 'update_status':
        if (newStatus) await handleStatusUpdate(arabon, newStatus);
        break;
      case 'delete':
        await handleDeleteArabon(arabon);
        break;
    }

    closeConfirmDialog();
  };

  // فلترة العناصر محلياً للبحث
  const filteredItems = arabonItems.filter((item) => {
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // تحميل المزيد
  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchArabonItems(nextCursor, true);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: ArabonStatus) => {
    return ArabonStatusColors[status] || 'default';
  };

  return (
    <RequireAdminPermission permission="read">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              إدارة العربون
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إدارة طلبات العربون ومتابعة حالاتها
            </Typography>
          </Box>
        </Box>

        {/* فلاتر البحث */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="البحث في العربون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="all">جميع الحالات</MenuItem>
                {Object.values(ArabonStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {ArabonStatusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* جدول العربون */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الطلب</TableCell>
                <TableCell>قيمة العربون</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>موعد التنفيذ</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && arabonItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      لا توجد طلبات متاحة
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.title}
                          </Typography>
                          {item.description && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {item.description.length > 50
                                ? `${item.description.substring(0, 50)}...`
                                : item.description
                              }
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.depositAmount ? `${item.depositAmount} ريال` : 'غير محدد'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={ArabonStatusLabels[item.status]}
                        size="small"
                        color={getStatusColor(item.status)}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.scheduleAt
                            ? new Date(item.scheduleAt).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'غير محدد'
                          }
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/arabon/${item._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="تغيير الحالة">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openConfirmDialog(item, 'update_status', ArabonStatus.CONFIRMED)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openConfirmDialog(item, 'delete')}
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

          {/* زر تحميل المزيد */}
          {hasMore && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
              </Button>
            </Box>
          )}
        </Paper>

        {/* نافذة التأكيد */}
        <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
          <DialogTitle>
            تأكيد العملية
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === 'update_status' && confirmDialog.newStatus && (
                <>هل أنت متأكد من تغيير حالة الطلب "{confirmDialog.arabon?.title}" إلى "{ArabonStatusLabels[confirmDialog.newStatus]}"؟</>
              )}
              {confirmDialog.action === 'delete' && (
                <>هل أنت متأكد من حذف الطلب "{confirmDialog.arabon?.title}"؟</>
              )}
            </Typography>
            {confirmDialog.action === 'delete' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                هذا الإجراء لا يمكن التراجع عنه
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog}>إلغاء</Button>
            <Button
              onClick={confirmAction}
              variant="contained"
              color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
            >
              تأكيد
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar للرسائل */}
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

export default ArabonListPage;
