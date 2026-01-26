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
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Stack,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllWithdrawals,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  type WithdrawalRequest,
} from '../../../api/wallet';

const WithdrawalDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  withdrawal: WithdrawalRequest | null;
}> = ({ open, onClose, withdrawal }) => {
  if (!withdrawal) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>تفاصيل طلب السحب</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid  size={{xs: 6}}>
              <Typography variant="caption" color="text.secondary">
                المبلغ
              </Typography>
              <Typography variant="h6">
                {withdrawal.amount.toFixed(2)} ر.ي
              </Typography>
            </Grid>
            <Grid  size={{xs: 6}}>
              <Typography variant="caption" color="text.secondary">
                الحالة
              </Typography>
              <Chip
                label={
                  withdrawal.status === 'pending'
                    ? 'معلق'
                    : withdrawal.status === 'approved'
                    ? 'موافق عليه'
                    : withdrawal.status === 'rejected'
                    ? 'مرفوض'
                    : 'ملغى'
                }
                color={
                  withdrawal.status === 'pending'
                    ? 'warning'
                    : withdrawal.status === 'approved'
                    ? 'success'
                    : 'error'
                }
                size="small"
              />
            </Grid>
              <Grid  size={{xs: 6}}>
              <Typography variant="caption" color="text.secondary">
                طريقة السحب
              </Typography>
              <Typography variant="body1">{withdrawal.method}</Typography>
            </Grid>
            <Grid  size={{xs: 6}}>
              <Typography variant="caption" color="text.secondary">
                نوع المستخدم
              </Typography>
              <Typography variant="body1">{withdrawal.userModel}</Typography>
            </Grid>
            <Grid  size={{xs: 12}}>
              <Typography variant="caption" color="text.secondary">
                معلومات الحساب
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  mt: 1,
                }}
              >
                <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                  {JSON.stringify(withdrawal.accountInfo, null, 2)}
                </pre>
              </Box>
            </Grid>
            {withdrawal.transactionRef && (
              <Grid  size={{xs: 12}}>
                <Typography variant="caption" color="text.secondary">
                  رقم المرجع
                </Typography>
                <Typography variant="body1">
                  {withdrawal.transactionRef}
                </Typography>
              </Grid>
            )}
            {withdrawal.notes && (
              <Grid  size={{xs: 12}}>
                <Typography variant="caption" color="text.secondary">
                  ملاحظات
                </Typography>
                <Typography variant="body1">{withdrawal.notes}</Typography>
              </Grid>
            )}
            {withdrawal.reason && (
              <Grid  size={{xs: 12}}>
                <Typography variant="caption" color="text.secondary">
                  سبب الرفض
                </Typography>
                <Typography variant="body1" color="error">
                  {withdrawal.reason}
                </Typography>
              </Grid>
            )}
            <Grid  size={{xs: 6}}>
              <Typography variant="caption" color="text.secondary">
                تاريخ الإنشاء
              </Typography>
              <Typography variant="body2">
                {new Date(withdrawal.createdAt).toLocaleString('ar-SA')}
              </Typography>
            </Grid>
            <Grid  size={{xs: 6}}>
              <Typography variant="caption" color="text.secondary">
                آخر تحديث
              </Typography>
              <Typography variant="body2">
                {new Date(withdrawal.updatedAt).toLocaleString('ar-SA')}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

const ApproveDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onApprove: (data: { transactionRef?: string; notes?: string }) => void;
  loading: boolean;
}> = ({ open, onClose, onApprove, loading }) => {
  const [formData, setFormData] = useState({
    transactionRef: '',
    notes: '',
  });

  const handleSubmit = () => {
    onApprove({
      transactionRef: formData.transactionRef || undefined,
      notes: formData.notes || undefined,
    });
    setFormData({ transactionRef: '', notes: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>الموافقة على طلب السحب</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="رقم المرجع (اختياري)"
            value={formData.transactionRef}
            onChange={(e) =>
              setFormData({ ...formData, transactionRef: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="ملاحظات (اختياري)"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
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
          color="success"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          موافقة
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RejectDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
}> = ({ open, onClose, onReject, loading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(reason);
      setReason('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>رفض طلب السحب</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="سبب الرفض *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            error={!reason.trim()}
            helperText={!reason.trim() ? 'يجب إدخال سبب الرفض' : ''}
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
          color="error"
          disabled={loading || !reason.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          رفض
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function WithdrawalManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userModelFilter, setUserModelFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);

  const queryClient = useQueryClient();

  // Fetch withdrawals
  const { data, isLoading, error } = useQuery({
    queryKey: ['withdrawals', statusFilter, userModelFilter, page],
    queryFn: () =>
      getAllWithdrawals({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        userModel: userModelFilter !== 'all' ? userModelFilter : undefined,
        page,
        limit: 20,
      }),
  });

  // Fetch pending withdrawals count
  const { data: pendingData } = useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: getPendingWithdrawals,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (data: { transactionRef?: string; notes?: string }) =>
      approveWithdrawal(selectedWithdrawal!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      setApproveDialogOpen(false);
      setSelectedWithdrawal(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      rejectWithdrawal(selectedWithdrawal!._id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      setRejectDialogOpen(false);
      setSelectedWithdrawal(null);
    },
  });

  const withdrawals = data?.data || [];
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      w._id.toLowerCase().includes(search) ||
      w.userId.toLowerCase().includes(search) ||
      w.amount.toString().includes(search)
    );
  });

  const handleViewDetails = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setDetailsDialogOpen(true);
  };

  const handleApprove = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setApproveDialogOpen(true);
  };

  const handleReject = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setRejectDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          إدارة طلبات السحب
        </Typography>
        {pendingData && pendingData.length > 0 && (
          <Chip
            label={`${pendingData.length} طلب معلق`}
            color="warning"
            icon={<FilterListIcon />}
          />
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid  size={{xs: 12, md: 4}}>
              <TextField
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: searchTerm && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid  size={{xs: 12, md: 4}}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  label="الحالة"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="pending">معلق</MenuItem>
                  <MenuItem value="approved">موافق عليه</MenuItem>
                  <MenuItem value="rejected">مرفوض</MenuItem>
                  <MenuItem value="cancelled">ملغى</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid  size={{xs: 12, md: 4}}>
              <FormControl fullWidth>
                <InputLabel>نوع المستخدم</InputLabel>
                <Select
                  value={userModelFilter}
                  onChange={(e) => {
                    setUserModelFilter(e.target.value);
                    setPage(1);
                  }}
                  label="نوع المستخدم"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="User">مستخدم</MenuItem>
                  <MenuItem value="Driver">سائق</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          فشل في تحميل طلبات السحب
        </Alert>
      )}

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المعرف</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>الطريقة</TableCell>
                  <TableCell>نوع المستخدم</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ الإنشاء</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWithdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        لا توجد طلبات سحب
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell>{withdrawal._id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {withdrawal.amount.toFixed(2)} ر.ي
                        </Typography>
                      </TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
                      <TableCell>{withdrawal.userModel}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(withdrawal.status)}
                          color={getStatusColor(withdrawal.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(withdrawal.createdAt).toLocaleDateString(
                          'ar-SA'
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(withdrawal)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {withdrawal.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(withdrawal)}
                                color="success"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleReject(withdrawal)}
                                color="error"
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={data.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <WithdrawalDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedWithdrawal(null);
        }}
        withdrawal={selectedWithdrawal}
      />

      <ApproveDialog
        open={approveDialogOpen}
        onClose={() => {
          setApproveDialogOpen(false);
          setSelectedWithdrawal(null);
        }}
        onApprove={(data) => approveMutation.mutate(data)}
        loading={approveMutation.isPending}
      />

      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedWithdrawal(null);
        }}
        onReject={(reason) => rejectMutation.mutate(reason)}
        loading={rejectMutation.isPending}
      />
    </Box>
  );
}
