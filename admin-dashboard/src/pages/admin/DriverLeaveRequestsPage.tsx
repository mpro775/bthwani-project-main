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
  Avatar,
  Tooltip,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Event as EventIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Schedule as PendingIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getDriverLeaveRequests,
  createDriverLeaveRequest,
  updateDriverLeaveRequest,
  approveDriverLeaveRequest,
  rejectDriverLeaveRequest,
  deleteDriverLeaveRequest,
  getLeaveRequestStats,
  type DriverLeaveRequest,
  type DriverLeaveRequestFormData
} from '../../api/driverLeaveRequests';
import { getDrivers, type Driver } from '../../api/drivers';

const LeaveRequestFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  request?: DriverLeaveRequest | null;
  onSubmit: (data: DriverLeaveRequestFormData) => void;
  loading: boolean;
}> = ({ open, onClose, request, onSubmit, loading }) => {
  const [formData, setFormData] = useState<DriverLeaveRequestFormData>({
    driverId: '',
    fromDate: dayjs().format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
    reason: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => getDrivers({ pageSize: 1000 }),
    enabled: open,
  });
  const driverOptions = Array.isArray(drivers) ? drivers : drivers?.drivers ?? [];

  React.useEffect(() => {
    if (request) {
      setFormData({
        driverId: request.driverId,
        fromDate: dayjs(request.fromDate).format('YYYY-MM-DD'),
        toDate: dayjs(request.toDate).format('YYYY-MM-DD'),
        reason: request.reason || '',
        status: request.status,
      });
    } else {
      setFormData({
        driverId: '',
        fromDate: dayjs().format('YYYY-MM-DD'),
        toDate: dayjs().format('YYYY-MM-DD'),
        reason: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [request, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.driverId) {
      newErrors.driverId = 'يجب اختيار السائق';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'تاريخ البداية مطلوب';
    }

    if (!formData.toDate) {
      newErrors.toDate = 'تاريخ النهاية مطلوب';
    }

    if (formData.fromDate && formData.toDate && formData.fromDate > formData.toDate) {
      newErrors.toDate = 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (field: 'fromDate' | 'toDate') => (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };

  const calculateDuration = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = dayjs(formData.fromDate);
    const end = dayjs(formData.toDate);
    return end.diff(start, 'day') + 1;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {request ? 'تعديل طلب إجازة' : 'إضافة طلب إجازة جديد'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth error={!!errors.driverId}>
            <InputLabel>السائق</InputLabel>
            <Select
              value={formData.driverId}
              onChange={(e: SelectChangeEvent) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}              label="السائق"
            >
              {driverOptions.map((driver: Driver) => (
                <MenuItem key={driver._id} value={driver._id}>
                  {driver.fullName} - {driver.vehicleType}
                </MenuItem>
              ))}
            </Select>
            {errors.driverId && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.driverId}
              </Typography>
            )}
          </FormControl>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="تاريخ البداية"
                  value={dayjs(formData.fromDate)}
                  onChange={handleDateChange('fromDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.fromDate,
                      helperText: errors.fromDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="تاريخ النهاية"
                  value={dayjs(formData.toDate)}
                  onChange={handleDateChange('toDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.toDate,
                      helperText: errors.toDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              مدة الإجازة: <strong>{calculateDuration()} يوم</strong>
            </Typography>
          </Box>

          <TextField
            label="سبب الإجازة"
            value={formData.reason}
            onChange={handleChange('reason')}
            fullWidth
            multiline
            rows={3}
            placeholder="اكتب سبب طلب الإجازة..."
          />

          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={(e: SelectChangeEvent) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'approved' | 'rejected' }))}              label="الحالة"
            >
              <MenuItem value="pending">معلق</MenuItem>
              <MenuItem value="approved">مُعتمد</MenuItem>
              <MenuItem value="rejected">مرفوض</MenuItem>
            </Select>
          </FormControl>
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
          {request ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function DriverLeaveRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<DriverLeaveRequest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DriverLeaveRequest | null>(null);

  const queryClient = useQueryClient();

  // Fetch leave requests
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['driverLeaveRequests'],
    queryFn: () => getDriverLeaveRequests(),
  });

  // Fetch leave request statistics
  const { data: stats } = useQuery({
    queryKey: ['leaveRequestStats'],
    queryFn: getLeaveRequestStats,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDriverLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequestStats'] });
      setDialogOpen(false);
      setEditingRequest(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: Partial<DriverLeaveRequestFormData> }) =>
      updateDriverLeaveRequest(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverLeaveRequests'] });
      setDialogOpen(false);
      setEditingRequest(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveDriverLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequestStats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectDriverLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequestStats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriverLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequestStats'] });
      setDeleteConfirm(null);
    },
  });

  const handleEdit = (request: DriverLeaveRequest) => {
    setEditingRequest(request);
    setDialogOpen(true);
  };

  const handleApprove = (request: DriverLeaveRequest) => {
    approveMutation.mutate(request._id!);
  };

  const handleReject = (request: DriverLeaveRequest) => {
    rejectMutation.mutate(request._id!);
  };

  const handleDelete = (request: DriverLeaveRequest) => {
    setDeleteConfirm(request);
  };

  const handleFormSubmit = (formData: DriverLeaveRequestFormData) => {
    if (editingRequest) {
      updateMutation.mutate({ id: editingRequest._id!, request: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const requests = requestsData?.requests || [];

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.driverId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'مُعتمد';
      case 'rejected': return 'مرفوض';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  const calculateDuration = (fromDate: string, toDate: string) => {
    const start = dayjs(fromDate);
    const end = dayjs(toDate);
    return end.diff(start, 'day') + 1;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل طلبات الإجازة: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة طلبات إجازات السائقين
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingRequest(null);
            setDialogOpen(true);
          }}
        >
          إضافة طلب إجازة
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الطلبات
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
                  <PendingIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.pendingRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      طلبات معلقة
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
                  <ApproveIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.approvedRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      طلبات مُعتمدة
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
                  <RejectIcon color="error" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.rejectedRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      طلبات مرفوضة
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
              placeholder="البحث في طلبات الإجازة..."
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="pending">معلق</MenuItem>
                <MenuItem value="approved">مُعتمد</MenuItem>
                <MenuItem value="rejected">مرفوض</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredRequests.length} طلب`}
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
                  <TableCell>السائق</TableCell>
                  <TableCell>الفترة</TableCell>
                  <TableCell>المدة</TableCell>
                  <TableCell>السبب</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="body2">
                          سائق {request.driverId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {calculateDuration(request.fromDate, request.toDate)} يوم
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {request.reason || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(request.createdAt || '')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(request)}
                            disabled={request.status === 'approved'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="اعتماد">
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(request)}
                                color="success"
                                disabled={approveMutation.isPending}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="رفض">
                              <IconButton
                                size="small"
                                onClick={() => handleReject(request)}
                                color="error"
                                disabled={rejectMutation.isPending}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(request)}
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

      {filteredRequests.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <EventIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد طلبات إجازة</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all'
              ? 'جرب مصطلح بحث مختلف أو تغيير فلتر الحالة'
              : 'ابدأ بإضافة طلب إجازة جديد'
            }
          </Typography>
        </Box>
      )}

      {/* Leave Request Form Dialog */}
      <LeaveRequestFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRequest(null);
        }}
        request={editingRequest}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف طلب الإجازة هذا؟
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
