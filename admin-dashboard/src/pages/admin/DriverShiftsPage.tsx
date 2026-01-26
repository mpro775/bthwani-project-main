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

  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import {
  getDriverShifts,
  createDriverShift,
  updateDriverShift,
  deleteDriverShift,
  type DriverShift
} from '../../api/drivers';

const ShiftFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  shift?: DriverShift | null;
  onSubmit: (data: Omit<DriverShift, '_id' | 'createdAt' | 'updatedAt'>) => void;
  loading: boolean;
}> = ({ open, onClose, shift, onSubmit, loading }) => {
  const [formData, setFormData] = useState<Omit<DriverShift, '_id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    dayOfWeek: undefined,
    specificDate: '',
    startLocal: '',
    endLocal: '',
    area: '',
    capacity: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || '',
        dayOfWeek: shift.dayOfWeek,
        specificDate: shift.specificDate || '',
        startLocal: shift.startLocal || '',
        endLocal: shift.endLocal || '',
        area: shift.area || '',
        capacity: shift.capacity || 0,
      });
    } else {
      setFormData({
        name: '',
        dayOfWeek: undefined,
        specificDate: '',
        startLocal: '',
        endLocal: '',
        area: '',
        capacity: 0,
      });
    }
    setErrors({});
  }, [shift, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الوردية مطلوب';
    }

    if (!formData.startLocal) {
      newErrors.startLocal = 'وقت البداية مطلوب';
    }

    if (!formData.endLocal) {
      newErrors.endLocal = 'وقت النهاية مطلوب';
    }

    if (formData.startLocal && formData.endLocal && formData.startLocal >= formData.endLocal) {
      newErrors.endLocal = 'يجب أن يكون وقت النهاية بعد وقت البداية';
    }

    if (formData.capacity < 0) {
      newErrors.capacity = 'السعة يجب أن تكون رقماً موجباً';
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeChange = (field: 'startLocal' | 'endLocal') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      specificDate: event.target.value
    }));
  };

  const handleDayOfWeekChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    setFormData(prev => ({
      ...prev,
      dayOfWeek: value === '' ? undefined : parseInt(value),
      specificDate: value === '' ? '' : prev.specificDate // Clear specific date if day of week is selected
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {shift ? 'تعديل وردية' : 'إضافة وردية جديدة'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="اسم الوردية"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            placeholder="مثال: وردية الصباح، وردية المساء..."
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>يوم الأسبوع</InputLabel>
                <Select
                  value={formData.dayOfWeek?.toString() || ''}
                  onChange={handleDayOfWeekChange}
                  label="يوم الأسبوع"
                >
                  <MenuItem value="">غير محدد</MenuItem>
                  <MenuItem value="0">الأحد</MenuItem>
                  <MenuItem value="1">الاثنين</MenuItem>
                  <MenuItem value="2">الثلاثاء</MenuItem>
                  <MenuItem value="3">الأربعاء</MenuItem>
                  <MenuItem value="4">الخميس</MenuItem>
                  <MenuItem value="5">الجمعة</MenuItem>
                  <MenuItem value="6">السبت</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="تاريخ محدد (اختياري)"
                type="date"
                value={formData.specificDate}
                onChange={handleDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="للورديات ذات التاريخ المحدد"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="وقت البداية"
                type="time"
                value={formData.startLocal}
                onChange={handleTimeChange('startLocal')}
                error={!!errors.startLocal}
                helperText={errors.startLocal}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="وقت النهاية"
                type="time"
                value={formData.endLocal}
                onChange={handleTimeChange('endLocal')}
                error={!!errors.endLocal}
                helperText={errors.endLocal}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            label="المنطقة"
            value={formData.area}
            onChange={handleChange('area')}
            fullWidth
            placeholder="مثال: صنعاء، عدن، تعز..."
          />

          <TextField
            label="السعة الاستيعابية"
            type="number"
            value={formData.capacity}
            onChange={handleChange('capacity')}
            error={!!errors.capacity}
            helperText={errors.capacity}
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {shift ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function DriverShiftsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<DriverShift | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DriverShift | null>(null);

  const queryClient = useQueryClient();

  // Fetch shifts
  const { data: shifts = [], isLoading, error } = useQuery({
    queryKey: ['driverShifts'],
    queryFn: getDriverShifts,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDriverShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverShifts'] });
      setDialogOpen(false);
      setEditingShift(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, shift }: { id: string; shift: Partial<DriverShift> }) =>
      updateDriverShift(id, shift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverShifts'] });
      setDialogOpen(false);
      setEditingShift(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriverShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverShifts'] });
      setDeleteConfirm(null);
    },
  });

  const handleEdit = (shift: DriverShift) => {
    setEditingShift(shift);
    setDialogOpen(true);
  };

  const handleDelete = (shift: DriverShift) => {
    setDeleteConfirm(shift);
  };

  const handleFormSubmit = (formData: Omit<DriverShift, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (editingShift) {
      updateMutation.mutate({ id: editingShift._id!, shift: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch =
      shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shift.area && shift.area.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesArea = !areaFilter || shift.area === areaFilter;

    return matchesSearch && matchesArea;
  });

  const getDayName = (dayOfWeek?: number) => {
    if (dayOfWeek === undefined) return 'غير محدد';
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    return dayjs(`2000-01-01 ${time}`).format('HH:mm');
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل الورديات: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة ورديات السائقين
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingShift(null);
            setDialogOpen(true);
          }}
        >
          إضافة وردية
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في الورديات..."
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
              <InputLabel>المنطقة</InputLabel>
              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                label="المنطقة"
              >
                <MenuItem value="">الكل</MenuItem>
                {Array.from(new Set(shifts.map(shift => shift.area).filter(Boolean))).map(area => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip
              label={`${filteredShifts.length} وردية`}
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
        <Grid container spacing={3}>
          {filteredShifts.map((shift) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={shift._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: 'primary.main',
                          mr: 2
                        }}
                      >
                        <ScheduleIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" noWrap>
                          {shift.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          سعة: {shift.capacity} سائق
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatTime(shift.startLocal)} - {formatTime(shift.endLocal)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {shift.dayOfWeek !== undefined ? getDayName(shift.dayOfWeek) : 'تاريخ محدد'}
                        </Typography>
                      </Box>

                      {shift.specificDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            التاريخ: {dayjs(shift.specificDate).format('YYYY-MM-DD')}
                          </Typography>
                        </Box>
                      )}

                      {shift.area && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {shift.area}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(shift)}
                        fullWidth
                      >
                        تعديل
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(shift)}
                        fullWidth
                      >
                        حذف
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredShifts.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ScheduleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد ورديات</Typography>
          <Typography variant="body2">
            {searchTerm || areaFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلتر'
              : 'ابدأ بإضافة وردية جديدة'
            }
          </Typography>
        </Box>
      )}

      {/* Shift Form Dialog */}
      <ShiftFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingShift(null);
        }}
        shift={editingShift}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الوردية "{deleteConfirm?.name}"؟
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
