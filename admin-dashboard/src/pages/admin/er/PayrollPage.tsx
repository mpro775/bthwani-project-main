import React, { useState, type ChangeEvent } from 'react';
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
  

} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Calculate as CalculateIcon,
  Money as MoneyIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
  Clear as ClearIcon,
  
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
  processPayroll,
  getPayrollStats,
  type Payroll,
  type PayrollFormData,
  type PayrollProcessData
} from '../../../api/payroll';
import { getEmployees } from '../../../api/employees';

type EmployeeInfo = { fullName?: string; email?: string; role?: string };

function isEmployeeInfo(value: unknown): value is EmployeeInfo {
  return typeof value === 'object' && value !== null;
}

const PayrollFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  payroll?: Payroll | null;
  onSubmit: (data: PayrollFormData) => void;
  loading: boolean;
}> = ({ open, onClose, payroll, onSubmit, loading }) => {
  const [formData, setFormData] = useState<PayrollFormData>({
    employee: '',
    periodStart: dayjs().startOf('month').format('YYYY-MM-DD'),
    periodEnd: dayjs().endOf('month').format('YYYY-MM-DD'),
    grossAmount: 0,
    deductions: 0,
    netAmount: 0,
    status: 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    enabled: open,
  });

  React.useEffect(() => {
    if (payroll) {
      setFormData({
        employee: payroll.employee,
        periodStart: dayjs(payroll.periodStart).format('YYYY-MM-DD'),
        periodEnd: dayjs(payroll.periodEnd).format('YYYY-MM-DD'),
        grossAmount: payroll.grossAmount,
        deductions: payroll.deductions,
        netAmount: payroll.netAmount,
        status: payroll.status,
      });
    } else {
      setFormData({
        employee: '',
        periodStart: dayjs().startOf('month').format('YYYY-MM-DD'),
        periodEnd: dayjs().endOf('month').format('YYYY-MM-DD'),
        grossAmount: 0,
        deductions: 0,
        netAmount: 0,
        status: 'pending',
      });
    }
    setErrors({});
  }, [payroll, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee) {
      newErrors.employee = 'يجب اختيار الموظف';
    }

    if (!formData.periodStart) {
      newErrors.periodStart = 'تاريخ البداية مطلوب';
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = 'تاريخ النهاية مطلوب';
    }

    if (formData.grossAmount <= 0) {
      newErrors.grossAmount = 'يجب إدخال إجمالي الراتب';
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
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate net amount
    if (field === 'grossAmount' || field === 'deductions') {
      const gross = field === 'grossAmount' ? parseFloat(value) || 0 : formData.grossAmount;
      const deductions = field === 'deductions' ? parseFloat(value) || 0 : formData.deductions;
      setFormData(prev => ({
        ...prev,
        netAmount: gross - deductions
      }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (field: 'periodStart' | 'periodEnd') => (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {payroll ? 'تعديل راتب' : 'إضافة راتب جديد'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth error={!!errors.employee}>
            <InputLabel>الموظف</InputLabel>
            <Select
              value={formData.employee}
              onChange={handleChange('employee') as (event: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }> | (Event & { target: { value: string; name: string; }; })) => void}
              label="الموظف"
            >
              {employees.map(employee => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.fullName} - {employee.role}
                </MenuItem>
              ))}
            </Select>
            {errors.employee && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.employee}
              </Typography>
            )}
          </FormControl>

          <Grid container spacing={2}>
            <Grid  size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="بداية الفترة"
                  value={dayjs(formData.periodStart)}
                  onChange={handleDateChange('periodStart')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.periodStart,
                      helperText: errors.periodStart,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid  size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="نهاية الفترة"
                  value={dayjs(formData.periodEnd)}
                  onChange={handleDateChange('periodEnd')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.periodEnd,
                      helperText: errors.periodEnd,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid  size={{ xs: 12, sm: 4 }}>
              <TextField
                label="إجمالي الراتب"
                type="number"
                value={formData.grossAmount}
                onChange={handleChange('grossAmount')}
                error={!!errors.grossAmount}
                helperText={errors.grossAmount}
                fullWidth
                required
                InputProps={{
                  startAdornment: <Typography variant="caption">ر.ي</Typography>,
                }}
              />
            </Grid>

            <Grid  size={{ xs: 12, sm: 4 }}>
              <TextField
                label="الخصومات"
                type="number"
                value={formData.deductions}
                onChange={handleChange('deductions')}
                fullWidth
                InputProps={{
                  startAdornment: <Typography variant="caption">ر.ي</Typography>,
                }}
              />
            </Grid>

            <Grid  size={{ xs: 12, sm: 4 }}>
              <TextField
                label="صافي الراتب"
                type="number"
                value={formData.netAmount}
                onChange={handleChange('netAmount')}
                fullWidth
                InputProps={{
                  startAdornment: <Typography variant="caption">ر.ي</Typography>,
                  readOnly: true,
                }}
                sx={{ bgcolor: 'grey.50' }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={handleChange('status') as (event: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }> | (Event & { target: { value: string; name: string; }; })) => void}
              label="الحالة"
            >
              <MenuItem value="pending">معلق</MenuItem>
              <MenuItem value="processed">معالج</MenuItem>
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
          {payroll ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ProcessPayrollDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollProcessData) => void;
  loading: boolean;
}> = ({ open, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<PayrollProcessData>({
    employee: '',
    periodStart: dayjs().startOf('month').format('YYYY-MM-DD'),
    periodEnd: dayjs().endOf('month').format('YYYY-MM-DD'),
    grossAmount: 0,
    deductions: 0,
    incentives: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    enabled: open,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee) {
      newErrors.employee = 'يجب اختيار الموظف';
    }

    if (formData.grossAmount <= 0) {
      newErrors.grossAmount = 'يجب إدخال إجمالي الراتب';
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

  const handleDateChange = (field: 'periodStart' | 'periodEnd') => (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        معالجة الراتب
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            سيتم إنشاء القيود المحاسبية تلقائياً لهذا الراتب
          </Alert>

          <FormControl fullWidth error={!!errors.employee}>
            <InputLabel>الموظف</InputLabel>
            <Select
              value={formData.employee}
              onChange={handleChange('employee') as (event: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }> | (Event & { target: { value: string; name: string; }; })) => void}
              label="الموظف"
            >
              {employees.map(employee => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.fullName} - {employee.role}
                </MenuItem>
              ))}
            </Select>
            {errors.employee && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.employee}
              </Typography>
            )}
          </FormControl>

          <Grid container spacing={2}>
            <Grid  size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="بداية الفترة"
                  value={dayjs(formData.periodStart)}
                  onChange={handleDateChange('periodStart')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid  size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="نهاية الفترة"
                  value={dayjs(formData.periodEnd)}
                  onChange={handleDateChange('periodEnd')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid  size={{ xs: 12, sm: 4 }}>
              <TextField
                label="إجمالي الراتب"
                type="number"
                value={formData.grossAmount}
                onChange={handleChange('grossAmount')}
                error={!!errors.grossAmount}
                helperText={errors.grossAmount}
                fullWidth
                required
                InputProps={{
                  startAdornment: <Typography variant="caption">ر.ي</Typography>,
                }}
              />
            </Grid>

            <Grid  size={{ xs: 12, sm: 4 }}>
              <TextField
                label="الخصومات"
                type="number"
                value={formData.deductions}
                onChange={handleChange('deductions')}
                fullWidth
                InputProps={{
                  startAdornment: <Typography variant="caption">ر.ي</Typography>,
                }}
              />
            </Grid>

            <Grid  size={{ xs: 12, sm: 4 }}>
              <TextField
                label="الحوافز"
                type="number"
                value={formData.incentives}
                onChange={handleChange('incentives')}
                fullWidth
                InputProps={{
                  startAdornment: <Typography variant="caption">ر.ي</Typography>,
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              صافي الراتب: <strong>{(formData.grossAmount + formData.incentives! - formData.deductions!).toFixed(2)} ر.ي</strong>
            </Typography>
          </Box>
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
          startIcon={loading ? <CircularProgress size={16} /> : <CalculateIcon />}
        >
          معالجة الراتب
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processed'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Payroll | null>(null);

  const queryClient = useQueryClient();

  // Fetch payrolls
  const { data: payrolls = [], isLoading, error } = useQuery({
    queryKey: ['payrolls'],
    queryFn: getPayrolls,
  });

  // Fetch payroll statistics
  const { data: stats } = useQuery({
    queryKey: ['payrollStats'],
    queryFn: () => getPayrollStats(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payrollStats'] });
      setDialogOpen(false);
      setEditingPayroll(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payroll }: { id: string; payroll: Partial<PayrollFormData> }) =>
      updatePayroll(id, payroll),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      setDialogOpen(false);
      setEditingPayroll(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      setDeleteConfirm(null);
    },
  });

  const processMutation = useMutation({
    mutationFn: processPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payrollStats'] });
      setProcessDialogOpen(false);
    },
  });

  const handleEdit = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    setDialogOpen(true);
  };

  const handleDelete = (payroll: Payroll) => {
    setDeleteConfirm(payroll);
  };

  const handleFormSubmit = (formData: PayrollFormData) => {
    if (editingPayroll) {
      updateMutation.mutate({ id: editingPayroll._id!, payroll: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleProcessSubmit = (processData: PayrollProcessData) => {
    processMutation.mutate(processData);
  };

  const filteredPayrolls = payrolls.filter(payroll => {
    const emp = isEmployeeInfo(payroll.employee) ? payroll.employee : undefined;
    const matchesSearch =
      emp?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل الرواتب: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة الرواتب والمكافآت
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={() => setProcessDialogOpen(true)}
          >
            معالجة راتب
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingPayroll(null);
              setDialogOpen(true);
            }}
          >
            إضافة راتب
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid  size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalGross)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الرواتب
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalDeductions)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الخصومات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalEmployees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      عدد الموظفين
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.processedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معالجة
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
              placeholder="البحث في الرواتب..."
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
                onChange={(e: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }> | (Event & { target: { value: string; name: string; }; })) => setStatusFilter(e.target.value as 'all' | 'pending' | 'processed')}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="pending">معلق</MenuItem>
                <MenuItem value="processed">معالج</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredPayrolls.length} راتب`}
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
                  <TableCell>الموظف</TableCell>
                  <TableCell>الفترة</TableCell>
                  <TableCell align="right">إجمالي الراتب</TableCell>
                  <TableCell align="right">الخصومات</TableCell>
                  <TableCell align="right">صافي الراتب</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayrolls.map((payroll) => {
                  const emp = isEmployeeInfo(payroll.employee) ? payroll.employee : undefined;
                  return (
                  <TableRow key={payroll._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {emp?.fullName?.charAt(0) || ''}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {emp?.fullName || ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp?.role || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(payroll.grossAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(payroll.deductions)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {formatCurrency(payroll.netAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payroll.status === 'processed' ? 'معالج' : 'معلق'}
                        color={payroll.status === 'processed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(payroll)}
                            disabled={payroll.status === 'processed'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(payroll)}
                            color="error"
                            disabled={payroll.status === 'processed'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  );})}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {filteredPayrolls.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <MoneyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد رواتب</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all'
              ? 'جرب مصطلح بحث مختلف أو تغيير فلتر الحالة'
              : 'ابدأ بإضافة راتب جديد'
            }
          </Typography>
        </Box>
      )}

      {/* Payroll Form Dialog */}
      <PayrollFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPayroll(null);
        }}
        payroll={editingPayroll}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Process Payroll Dialog */}
      <ProcessPayrollDialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        onSubmit={handleProcessSubmit}
        loading={processMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف راتب "{typeof deleteConfirm?.employee === 'string' ? '' : (deleteConfirm?.employee as EmployeeInfo | undefined)?.fullName}" للفترة{' '}
            {formatDate(deleteConfirm?.periodStart || '')} - {formatDate(deleteConfirm?.periodEnd || '')}؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            سيتم حذف القيود المحاسبية المرتبطة بهذا الراتب أيضاً
          </Alert>
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
