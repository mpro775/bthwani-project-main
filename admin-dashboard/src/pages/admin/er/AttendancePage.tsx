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
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Timer as LateIcon,
  Clear as ClearIcon,

} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getAttendance,
  recordAttendance,
  getTodayAttendance,
  type Attendance,
  type AttendanceFormData
} from '../../../api/attendance';
import { getEmployees,  type Employee } from '../../../api/employees';

const AttendanceFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => void;
  loading: boolean;
}> = ({ open, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<AttendanceFormData>({
    employee: '',
    date: dayjs().format('YYYY-MM-DD'),
    checkIn: dayjs().format('HH:mm'),
    status: 'present',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    enabled: open,
  });

  React.useEffect(() => {
    if (!open) {
      setFormData({
        employee: '',
        date: dayjs().format('YYYY-MM-DD'),
        checkIn: dayjs().format('HH:mm'),
        status: 'present',
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee) {
      newErrors.employee = 'يجب اختيار الموظف';
    }

    if (!formData.date) {
      newErrors.date = 'التاريخ مطلوب';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'وقت تسجيل الدخول مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof AttendanceFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleSelectChange = (field: keyof AttendanceFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      date: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };



  const handleStatusChange = (status: 'present' | 'absent' | 'late') => {
    setFormData(prev => ({ ...prev, status }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        تسجيل الحضور
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth error={!!errors.employee}>
            <InputLabel>الموظف</InputLabel>
            <Select
              value={formData.employee}
              onChange={handleSelectChange('employee')}
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

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="التاريخ"
              value={dayjs(formData.date)}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!errors.date,
                  helperText: errors.date,
                },
              }}
            />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="وقت الدخول"
              type="time"
              value={formData.checkIn}
              onChange={handleInputChange('checkIn')}
              error={!!errors.checkIn}
              helperText={errors.checkIn}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="وقت الخروج (اختياري)"
              type="time"
              value={formData.checkOut || ''}
              onChange={handleInputChange('checkOut')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              حالة الحضور:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={formData.status === 'present' ? 'contained' : 'outlined'}
                startIcon={<PresentIcon />}
                onClick={() => handleStatusChange('present')}
                color="success"
              >
                حاضر
              </Button>
              <Button
                variant={formData.status === 'absent' ? 'contained' : 'outlined'}
                startIcon={<AbsentIcon />}
                onClick={() => handleStatusChange('absent')}
                color="error"
              >
                غائب
              </Button>
              <Button
                variant={formData.status === 'late' ? 'contained' : 'outlined'}
                startIcon={<LateIcon />}
                onClick={() => handleStatusChange('late')}
                color="warning"
              >
                متأخر
              </Button>
            </Box>
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          تسجيل
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AttendanceCard: React.FC<{
  employee: Employee;
  attendance: Attendance[];
  onRecord: (employee: Employee) => void;
}> = ({ employee, attendance, onRecord }) => {
  const today = dayjs().format('YYYY-MM-DD');
  const todayAttendance = attendance.find(att => att.date === today);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <PresentIcon color="success" />;
      case 'absent': return <AbsentIcon color="error" />;
      case 'late': return <LateIcon color="warning" />;
      default: return <ScheduleIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: employee.status === 'active' ? 'primary.main' : 'grey.400',
              mr: 2
            }}
          >
            {getInitials(employee.fullName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>
              {employee.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.role}
            </Typography>
          </Box>
          <Chip
            label={employee.status === 'active' ? 'نشط' : 'غير نشط'}
            color={employee.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            حالة اليوم:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(todayAttendance?.status || 'none')}
            <Chip
              label={todayAttendance ? `حاضر - ${dayjs(todayAttendance.checkIn).format('HH:mm')}` : 'لم يسجل'}
              color={getStatusColor(todayAttendance?.status || 'none')}
              size="small"
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => onRecord(employee)}
          fullWidth
        >
          تسجيل الحضور
        </Button>
      </CardContent>
    </Card>
  );
};

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
console.log(selectedEmployee);
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  // Fetch today's attendance summary
  const { data: todayStats } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: getTodayAttendance,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch attendance records
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => getAttendance({ page: 1, pageSize: 100 }),
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: recordAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      setDialogOpen(false);
      setSelectedEmployee(null);
    },
  });

  const handleRecordAttendance = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleFormSubmit = (formData: AttendanceFormData) => {
    recordMutation.mutate(formData);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });



  if (employeesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة الحضور والانصراف
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          تسجيل حضور
        </Button>
      </Box>

      {/* Today's Stats */}
      {todayStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid  size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PresentIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {todayStats.present}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      حاضر اليوم
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
                  <AbsentIcon color="error" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {todayStats.absent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      غائب اليوم
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
                  <LateIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {todayStats.late}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متأخر اليوم
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
                      {todayStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الموظفين
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
              placeholder="البحث في الموظفين..."
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
                onChange={(e: SelectChangeEvent) =>
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
                }
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="inactive">غير نشط</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredEmployees.length} موظف`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {attendanceLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid  size={{ xs: 12, sm: 6, md: 4 }} key={employee._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AttendanceCard
                  employee={employee}
                  attendance={attendanceData?.attendance || []}
                  onRecord={handleRecordAttendance}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredEmployees.length === 0 && !employeesLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا يوجد موظفون</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all'
              ? 'جرب مصطلح بحث مختلف أو تغيير فلتر الحالة'
              : 'ابدأ بإضافة موظفين جدد'
            }
          </Typography>
        </Box>
      )}

      {/* Attendance Form Dialog */}
      <AttendanceFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        onSubmit={handleFormSubmit}
        loading={recordMutation.isPending}
      />
    </Box>
  );
}
