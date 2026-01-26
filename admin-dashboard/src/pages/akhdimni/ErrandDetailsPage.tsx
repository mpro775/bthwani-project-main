import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import {
  getErrandDetails,
  assignDriverToErrand,
  ERRAND_STATUS_LABELS,
  ERRAND_STATUS_COLORS,
  ERRAND_CATEGORIES,
  ERRAND_SIZES,
} from '../../api/akhdimni';
import type { ErrandOrder } from '../../api/akhdimni';

interface Driver {
  _id: string;
  fullName: string;
  phone?: string;
  isAvailable?: boolean;
}

const ErrandDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [errand, setErrand] = useState<ErrandOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Mock drivers list - في التطبيق الحقيقي، يجب جلبها من API
  const [availableDrivers] = useState<Driver[]>([
    { _id: '1', fullName: 'أحمد محمد', phone: '777123456', isAvailable: true },
    { _id: '2', fullName: 'خالد علي', phone: '777234567', isAvailable: true },
    { _id: '3', fullName: 'محمود حسن', phone: '777345678', isAvailable: true },
  ]);

  const fetchErrandDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getErrandDetails(id);
      setErrand(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل في جلب التفاصيل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrandDetails();
  }, [id]);

  const handleAssignDriver = async () => {
    if (!selectedDriver || !errand) return;

    try {
      setAssigning(true);
      await assignDriverToErrand(errand._id, selectedDriver._id);
      setAssignDialogOpen(false);
      setSelectedDriver(null);
      fetchErrandDetails(); // Refresh data
      alert('تم تعيين السائق بنجاح');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل في تعيين السائق');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusChip = (status: string) => {
    const label = ERRAND_STATUS_LABELS[status] || status;
    const color = ERRAND_STATUS_COLORS[status] || '#6c757d';
    return (
      <Chip
        label={label}
        sx={{
          backgroundColor: color,
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '0.875rem',
        }}
      />
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !errand) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'الطلب غير موجود'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/akhdimni')}
          sx={{ mt: 2 }}
        >
          العودة للقائمة
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/akhdimni')}
          >
            رجوع
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {errand.orderNumber}
          </Typography>
          {getStatusChip(errand.status)}
        </Box>
        {errand.status === 'created' && !errand.driver && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setAssignDialogOpen(true)}
          >
            تعيين سائق
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Customer Info */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات العميل
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>
                  <strong>الاسم:</strong> {errand.user?.fullName || 'غير متوفر'}
                </Typography>
                {errand.user?.phone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon fontSize="small" />
                    <Typography>{errand.user.phone}</Typography>
                  </Box>
                )}
                {errand.user?.email && (
                  <Typography>
                    <strong>البريد:</strong> {errand.user.email}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Driver Info */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات السائق
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {errand.driver ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography>
                    <strong>الاسم:</strong> {errand.driver.fullName}
                  </Typography>
                  {errand.driver.phone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" />
                      <Typography>{errand.driver.phone}</Typography>
                    </Box>
                  )}
                  {errand.assignedAt && (
                    <Typography color="textSecondary" variant="body2">
                      تم التعيين: {formatDate(errand.assignedAt)}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Alert severity="info">لم يُعين سائق بعد</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Locations */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                مواقع التوصيل
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {/* Pickup */}
                <Grid  size={{xs: 12, md: 6}}>
                  <Box
                    p={2}
                    bgcolor="#e3f2fd"
                    borderRadius={2}
                    border="2px solid #2196f3"
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PlaceIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        نقطة الاستلام
                      </Typography>
                    </Box>
                    <Typography>{errand.errand.pickup.label || '—'}</Typography>
                    {errand.errand.pickup.city && (
                      <Typography variant="body2" color="textSecondary">
                        {errand.errand.pickup.city}
                        {errand.errand.pickup.street &&
                          ` • ${errand.errand.pickup.street}`}
                      </Typography>
                    )}
                    {errand.errand.pickup.contactName && (
                      <Box mt={1}>
                        <Typography variant="body2">
                          جهة الاتصال: {errand.errand.pickup.contactName}
                        </Typography>
                        {errand.errand.pickup.phone && (
                          <Typography variant="body2">
                            📞 {errand.errand.pickup.phone}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Dropoff */}
                <Grid  size={{xs: 12, md: 6}}>
                  <Box
                    p={2}
                    bgcolor="#e8f5e9"
                    borderRadius={2}
                    border="2px solid #4caf50"
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PlaceIcon color="success" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        نقطة التسليم
                      </Typography>
                    </Box>
                    <Typography>{errand.errand.dropoff.label || '—'}</Typography>
                    {errand.errand.dropoff.city && (
                      <Typography variant="body2" color="textSecondary">
                        {errand.errand.dropoff.city}
                        {errand.errand.dropoff.street &&
                          ` • ${errand.errand.dropoff.street}`}
                      </Typography>
                    )}
                    {errand.errand.dropoff.contactName && (
                      <Box mt={1}>
                        <Typography variant="body2">
                          جهة الاتصال: {errand.errand.dropoff.contactName}
                        </Typography>
                        {errand.errand.dropoff.phone && (
                          <Typography variant="body2">
                            📞 {errand.errand.dropoff.phone}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Details */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                تفاصيل الطلب
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">النوع:</Typography>
                  <Typography fontWeight="bold">
                    {ERRAND_CATEGORIES[errand.errand.category] ||
                      errand.errand.category}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">الحجم:</Typography>
                  <Typography fontWeight="bold">
                    {ERRAND_SIZES[errand.errand.size] || errand.errand.size}
                  </Typography>
                </Box>
                {errand.errand.weightKg && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">الوزن:</Typography>
                    <Typography fontWeight="bold">
                      {errand.errand.weightKg} كجم
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">المسافة:</Typography>
                  <Typography fontWeight="bold">
                    {errand.errand.distanceKm.toFixed(1)} كم
                  </Typography>
                </Box>
                {errand.errand.description && (
                  <Box>
                    <Typography color="textSecondary">الوصف:</Typography>
                    <Typography>{errand.errand.description}</Typography>
                  </Box>
                )}
                {errand.notes && (
                  <Box>
                    <Typography color="textSecondary">ملاحظات:</Typography>
                    <Typography>{errand.notes}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Details */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                التفاصيل المالية
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">رسوم التوصيل:</Typography>
                  <Typography fontWeight="bold">
                    {errand.deliveryFee} ريال
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">الإجمالي:</Typography>
                  <Typography fontWeight="bold" color="primary">
                    {errand.totalPrice} ريال
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">طريقة الدفع:</Typography>
                  <Typography fontWeight="bold">
                    {errand.paymentMethod}
                  </Typography>
                </Box>
                {errand.scheduledFor && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">موعد التنفيذ:</Typography>
                    <Typography fontWeight="bold">
                      {formatDate(errand.scheduledFor)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline */}
        {errand.statusHistory && errand.statusHistory.length > 0 && (
          <Grid  size={{xs: 12}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  سجل الحالات
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  {errand.statusHistory.map((item, index) => (
                    <Box key={index} display="flex" gap={2}>
                      <Box
                        width={12}
                        height={12}
                        borderRadius="50%"
                        bgcolor={ERRAND_STATUS_COLORS[item.status]}
                        mt={0.5}
                      />
                      <Box flex={1}>
                        <Typography fontWeight="bold">
                          {ERRAND_STATUS_LABELS[item.status]}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(item.timestamp)}
                        </Typography>
                        {item.note && (
                          <Typography variant="body2">{item.note}</Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Assign Driver Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تعيين سائق للمهمة</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <Autocomplete
              options={availableDrivers}
              getOptionLabel={(option) => option.fullName}
              value={selectedDriver}
              onChange={(_, newValue) => setSelectedDriver(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="اختر السائق"
                  placeholder="ابحث عن سائق..."
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography>{option.fullName}</Typography>
                    {option.phone && (
                      <Typography variant="caption" color="textSecondary">
                        {option.phone}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleAssignDriver}
            disabled={!selectedDriver || assigning}
          >
            {assigning ? <CircularProgress size={24} /> : 'تأكيد'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ErrandDetailsPage;

