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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as AssetIcon,
  Computer as ComputerIcon,
  Chair as ChairIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as AvailableIcon,
  Person as InUseIcon,
  Clear as ClearIcon,
  AssignmentTurnedIn as AssignIcon,
  AssignmentReturn as UnassignIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  unassignAsset,
  getAssetStats,
  type Asset,
  type AssetFormData
} from '../../../api/assets';
import { getEmployees } from '../../../api/employees';

const AssetFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  asset?: Asset | null;
  onSubmit: (data: AssetFormData) => void;
  loading: boolean;
}> = ({ open, onClose, asset, onSubmit, loading }) => {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: '',
    serialNumber: '',
    purchaseDate: dayjs().format('YYYY-MM-DD'),
    status: 'available',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});



  React.useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        category: asset.category || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: dayjs(asset.purchaseDate).format('YYYY-MM-DD'),
        status: asset.status || 'available',
        assignedTo: asset.assignedTo || '',
        location: asset.location || '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        serialNumber: '',
        purchaseDate: dayjs().format('YYYY-MM-DD'),
        status: 'available',
        location: '',
      });
    }
    setErrors({});
  }, [asset, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الأصل مطلوب';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'فئة الأصل مطلوبة';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'تاريخ الشراء مطلوب';
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

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      purchaseDate: newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')
    }));
  };

 

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {asset ? 'تعديل أصل' : 'إضافة أصل جديد'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="اسم الأصل"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />

          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>فئة الأصل</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange('category') as (event: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }> | (Event & { target: { value: string; name: string; }; })) => void}
              label="فئة الأصل"
            >
              <MenuItem value="أجهزة">أجهزة</MenuItem>
              <MenuItem value="أثاث">أثاث</MenuItem>
              <MenuItem value="معدات">معدات</MenuItem>
              <MenuItem value="مركبات">مركبات</MenuItem>
              <MenuItem value="أخرى">أخرى</MenuItem>
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.category}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="الرقم التسلسلي"
            value={formData.serialNumber}
            onChange={handleChange('serialNumber')}
            fullWidth
            helperText="اختياري - للأجهزة والمعدات المهمة"
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ الشراء"
              value={dayjs(formData.purchaseDate)}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!errors.purchaseDate,
                  helperText: errors.purchaseDate,
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="الموقع"
            value={formData.location}
            onChange={handleChange('location')}
            fullWidth
            placeholder="مثال: صنعاء، عدن، تعز..."
          />

          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={handleChange('status') as (event: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }> | (Event & { target: { value: string; name: string; }; })) => void}
              label="الحالة"
            >
              <MenuItem value="available">متاح</MenuItem>
              <MenuItem value="in-use">قيد الاستخدام</MenuItem>
              <MenuItem value="maintenance">صيانة</MenuItem>
              <MenuItem value="lost">مفقود</MenuItem>
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
          {asset ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AssignAssetDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSubmit: (employeeId: string) => void;
  loading: boolean;
}> = ({ open, onClose, asset, onSubmit, loading }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    enabled: open,
  });

  const handleSubmit = () => {
    if (selectedEmployee) {
      onSubmit(selectedEmployee);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        تعيين أصل: {asset?.name}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>الموظف</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              label="الموظف"
            >
              {employees.map(employee => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.fullName} - {employee.role}
                </MenuItem>
              ))}
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
          disabled={loading || !selectedEmployee}
          startIcon={loading ? <CircularProgress size={16} /> : <AssignIcon />}
        >
          تعيين
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in-use' | 'maintenance' | 'lost'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assigningAsset, setAssigningAsset] = useState<Asset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Asset | null>(null);

  const queryClient = useQueryClient();

  // Fetch assets
  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  });

  // Fetch asset statistics
  const { data: stats } = useQuery({
    queryKey: ['assetStats'],
    queryFn: getAssetStats,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assetStats'] });
      setDialogOpen(false);
      setEditingAsset(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, asset }: { id: string; asset: Partial<AssetFormData> }) =>
      updateAsset(id, asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setDialogOpen(false);
      setEditingAsset(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assetStats'] });
      setDeleteConfirm(null);
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ assetId, employeeId }: { assetId: string; employeeId: string }) =>
      assignAsset(assetId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setAssignDialogOpen(false);
      setAssigningAsset(null);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: unassignAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setDialogOpen(true);
  };

  const handleDelete = (asset: Asset) => {
    setDeleteConfirm(asset);
  };

  const handleAssign = (asset: Asset) => {
    setAssigningAsset(asset);
    setAssignDialogOpen(true);
  };

  const handleUnassign = (asset: Asset) => {
    unassignMutation.mutate(asset._id!);
  };

  const handleFormSubmit = (formData: AssetFormData) => {
    if (editingAsset) {
      updateMutation.mutate({ id: editingAsset._id!, asset: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAssignSubmit = (employeeId: string) => {
    if (assigningAsset) {
      assignMutation.mutate({ assetId: assigningAsset._id!, employeeId });
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

 
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'in-use': return 'primary';
      case 'maintenance': return 'warning';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'أجهزة':
      case 'اجهزة':
        return <ComputerIcon />;
      case 'أثاث':
      case 'اثاث':
        return <ChairIcon />;
      case 'معدات':
        return <BuildIcon />;
      default:
        return <AssetIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل الأصول: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة الأصول
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingAsset(null);
            setDialogOpen(true);
          }}
        >
          إضافة أصل
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid  size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssetIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalAssets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الأصول
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
                  <AvailableIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.availableAssets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متاحة
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
                  <InUseIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.inUseAssets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      قيد الاستخدام
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
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.maintenanceAssets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      صيانة
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
              placeholder="البحث في الأصول..."
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'in-use' | 'maintenance' | 'lost')}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="available">متاح</MenuItem>
                <MenuItem value="in-use">قيد الاستخدام</MenuItem>
                <MenuItem value="maintenance">صيانة</MenuItem>
                <MenuItem value="lost">مفقود</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="الفئة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="أجهزة">أجهزة</MenuItem>
                <MenuItem value="أثاث">أثاث</MenuItem>
                <MenuItem value="معدات">معدات</MenuItem>
                <MenuItem value="مركبات">مركبات</MenuItem>
                <MenuItem value="أخرى">أخرى</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredAssets.length} أصل`}
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
          {filteredAssets.map((asset) => (
            <Grid  size={{ xs: 12, sm: 6, md: 4 }} key={asset._id}>
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
                        {getCategoryIcon(asset.category)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" noWrap>
                          {asset.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {asset.category}
                        </Typography>
                      </Box>
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الرقم التسلسلي: {asset.serialNumber || 'غير محدد'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          تاريخ الشراء: {formatDate(asset.purchaseDate)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الموقع: {asset.location || 'غير محدد'}
                        </Typography>
                      </Box>

                      {asset.assignedTo && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            مُعيَّن ل: {asset.assignedTo}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(asset)}
                        fullWidth
                      >
                        تعديل
                      </Button>

                      {asset.status === 'available' ? (
                        <Button
                          size="small"
                          startIcon={<AssignIcon />}
                          onClick={() => handleAssign(asset)}
                          color="primary"
                          variant="outlined"
                          fullWidth
                        >
                          تعيين
                        </Button>
                      ) : asset.status === 'in-use' ? (
                        <Button
                          size="small"
                          startIcon={<UnassignIcon />}
                          onClick={() => handleUnassign(asset)}
                          color="secondary"
                          variant="outlined"
                          fullWidth
                        >
                          إلغاء تعيين
                        </Button>
                      ) : null}

                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(asset)}
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

      {filteredAssets.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <AssetIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد أصول</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter !== 'all' || categoryFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'ابدأ بإضافة أصل جديد'
            }
          </Typography>
        </Box>
      )}

      {/* Asset Form Dialog */}
      <AssetFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAsset(null);
        }}
        asset={editingAsset}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Assign Asset Dialog */}
      <AssignAssetDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setAssigningAsset(null);
        }}
        asset={assigningAsset}
        onSubmit={handleAssignSubmit}
        loading={assignMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الأصل "{deleteConfirm?.name}"؟
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
