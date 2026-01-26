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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as AssetIcon,
  Computer as ComputerIcon,
  Chair as ChairIcon,
  Build as BuildIcon,
  TwoWheeler as MotorcycleIcon,
  DirectionsCar as CarIcon,
  Clear as ClearIcon,
  AssignmentTurnedIn as AssignIcon,
  AssignmentReturn as UnassignIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getDriverAssets,
  createDriverAsset,
  updateDriverAsset,
  deleteDriverAsset,
  type DriverAsset
} from '../../api/drivers';
import { getEmployees } from '../../api/employees';

const getTypeIcon = (type: string): React.ReactNode => {
  switch (type.toLowerCase()) {
    case 'دراجة نارية':
    case 'motorcycle':
      return <MotorcycleIcon />;
    case 'سيارة':
    case 'car':
      return <CarIcon />;
    case 'جهاز':
    case 'device':
    case 'computer':
      return <ComputerIcon />;
    case 'أثاث':
    case 'furniture':
      return <ChairIcon />;
    case 'معدات':
    case 'equipment':
      return <BuildIcon />;
    default:
      return <AssetIcon />;
  }
};

const AssetFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  asset?: DriverAsset | null;
  onSubmit: (data: Omit<DriverAsset, '_id' | 'createdAt' | 'updatedAt'>) => void;
  loading: boolean;
}> = ({ open, onClose, asset, onSubmit, loading }) => {
  const [formData, setFormData] = useState<Omit<DriverAsset, '_id' | 'createdAt' | 'updatedAt'>>({
    code: '',
    type: '',
    brand: '',
    model: '',
    serial: '',
    status: 'available',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (asset) {
      setFormData({
        code: asset.code || '',
        type: asset.type || '',
        brand: asset.brand || '',
        model: asset.model || '',
        serial: asset.serial || '',
        status: asset.status || 'available',
      });
    } else {
      setFormData({
        code: '',
        type: '',
        brand: '',
        model: '',
        serial: '',
        status: 'available',
      });
    }
    setErrors({});
  }, [asset, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'كود الأصل مطلوب';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'نوع الأصل مطلوب';
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

  // removed duplicate icon helper

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {asset ? 'تعديل أصل' : 'إضافة أصل جديد'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="كود الأصل"
            value={formData.code}
            onChange={handleChange('code')}
            error={!!errors.code}
            helperText={errors.code}
            fullWidth
            required
            placeholder="مثال: ASSET-001"
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />

          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>نوع الأصل</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              label="نوع الأصل"
            >
              <MenuItem value="دراجة نارية">دراجة نارية</MenuItem>
              <MenuItem value="سيارة">سيارة</MenuItem>
              <MenuItem value="جهاز">جهاز</MenuItem>
              <MenuItem value="أثاث">أثاث</MenuItem>
              <MenuItem value="معدات">معدات</MenuItem>
              <MenuItem value="أخرى">أخرى</MenuItem>
            </Select>
            {errors.type && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.type}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="الماركة"
            value={formData.brand}
            onChange={handleChange('brand')}
            fullWidth
            placeholder="مثال: هوندا، تويوتا..."
          />

          <TextField
            label="الموديل"
            value={formData.model}
            onChange={handleChange('model')}
            fullWidth
            placeholder="مثال: 2023، V6..."
          />

          <TextField
            label="الرقم التسلسلي"
            value={formData.serial}
            onChange={handleChange('serial')}
            fullWidth
            placeholder="الرقم التسلسلي أو رقم اللوحة"
            inputProps={{ style: { fontFamily: 'monospace' } }}
          />

          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available'|'assigned'|'repair'|'lost'|'retired' }))}
              label="الحالة"
            >
              <MenuItem value="available">متاح</MenuItem>
              <MenuItem value="assigned">مُعيَّن</MenuItem>
              <MenuItem value="repair">صيانة</MenuItem>
              <MenuItem value="lost">مفقود</MenuItem>
              <MenuItem value="retired">مُلغى</MenuItem>
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
  asset: DriverAsset | null;
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
        تعيين أصل: {asset?.code}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            سيتم تعيين هذا الأصل للموظف المختار
          </Alert>

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

export default function DriverAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'assigned' | 'repair' | 'lost' | 'retired'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DriverAsset | null>(null);
  const [assigningAsset, setAssigningAsset] = useState<DriverAsset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DriverAsset | null>(null);

  const queryClient = useQueryClient();

  // Fetch assets
  const { data: assetsData, isLoading, error } = useQuery({
    queryKey: ['driverAssets'],
    queryFn: () => getDriverAssets(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDriverAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverAssets'] });
      setDialogOpen(false);
      setEditingAsset(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, asset }: { id: string; asset: Partial<DriverAsset> }) =>
      updateDriverAsset(id, asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverAssets'] });
      setDialogOpen(false);
      setEditingAsset(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriverAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverAssets'] });
      setDeleteConfirm(null);
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ assetId, employeeId }: { assetId: string; employeeId: string }) =>
      updateDriverAsset(assetId, { status: 'assigned', assignedTo: employeeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverAssets'] });
      setAssignDialogOpen(false);
      setAssigningAsset(null);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: ({ assetId }: { assetId: string }) =>
      updateDriverAsset(assetId, { status: 'available', assignedTo: undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverAssets'] });
    },
  });

  const handleEdit = (asset: DriverAsset) => {
    setEditingAsset(asset);
    setDialogOpen(true);
  };

  const handleDelete = (asset: DriverAsset) => {
    setDeleteConfirm(asset);
  };

  const handleAssign = (asset: DriverAsset) => {
    setAssigningAsset(asset);
    setAssignDialogOpen(true);
  };

  const handleUnassign = (asset: DriverAsset) => {
    unassignMutation.mutate({ assetId: asset._id! });
  };

  const handleFormSubmit = (formData: Omit<DriverAsset, '_id' | 'createdAt' | 'updatedAt'>) => {
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

  const assets = assetsData?.assets || [];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.brand && asset.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.serial && asset.serial.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = !typeFilter || asset.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Chip label="متاح" color="success" size="small" />;
      case 'assigned': return <Chip label="مُعيَّن" color="primary" size="small" />;
      case 'repair': return <Chip label="صيانة" color="warning" size="small" />;
      case 'lost': return <Chip label="مفقود" color="error" size="small" />;
      case 'retired': return <Chip label="مُلغى" color="default" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'available': return 'success';
  //     case 'assigned': return 'primary';
  //     case 'repair': return 'warning';
  //     case 'lost': return 'error';
  //     case 'retired': return 'default';
  //     default: return 'default';
  //   }
  // };

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
          إدارة أصول السائقين
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'assigned' | 'repair' | 'lost' | 'retired')}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="available">متاح</MenuItem>
                <MenuItem value="assigned">مُعيَّن</MenuItem>
                <MenuItem value="repair">صيانة</MenuItem>
                <MenuItem value="lost">مفقود</MenuItem>
                <MenuItem value="retired">مُلغى</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>النوع</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="النوع"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="دراجة نارية">دراجة نارية</MenuItem>
                <MenuItem value="سيارة">سيارة</MenuItem>
                <MenuItem value="جهاز">جهاز</MenuItem>
                <MenuItem value="أثاث">أثاث</MenuItem>
                <MenuItem value="معدات">معدات</MenuItem>
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
        <Grid container spacing={3} component="div">
          {filteredAssets.map((asset) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={asset._id} component="div">
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
                        {getTypeIcon(asset.type)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                          {asset.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {asset.type}
                        </Typography>
                      </Box>
                      {getStatusIcon(asset.status)}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الماركة: {asset.brand || 'غير محدد'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الموديل: {asset.model || 'غير محدد'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الرقم التسلسلي: {asset.serial || 'غير محدد'}
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
                      ) : asset.status === 'assigned' ? (
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
            {searchTerm || statusFilter !== 'all' || typeFilter
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
            هل أنت متأكد من حذف الأصل "{deleteConfirm?.code}"؟
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
