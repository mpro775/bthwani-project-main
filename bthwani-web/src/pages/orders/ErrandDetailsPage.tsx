import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Place as PlaceIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  getErrandDetails,
  cancelErrand,
  rateErrand,
  type ErrandOrder,
} from '../../api/akhdimni';

const ERRAND_STATUS_LABELS: Record<string, string> = {
  created: 'تم الإنشاء',
  assigned: 'تم التعيين',
  picked_up: 'تم الاستلام',
  in_transit: 'في الطريق',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const ERRAND_STATUS_COLORS: Record<string, string> = {
  created: '#6c757d',
  assigned: '#0dcaf0',
  picked_up: '#ffc107',
  in_transit: '#0d6efd',
  delivered: '#198754',
  cancelled: '#dc3545',
};

const ErrandDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [errand, setErrand] = useState<ErrandOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  // Rating Dialog
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [driverRating, setDriverRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ratingComments, setRatingComments] = useState('');
  const [rating, setRating] = useState(false);

  const fetchDetails = async () => {
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
    fetchDetails();
  }, [id]);

  const handleCancel = async () => {
    if (!errand || !cancelReason.trim()) return;
    
    try {
      setCancelling(true);
      await cancelErrand(errand._id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
      alert('تم إلغاء الطلب بنجاح');
      fetchDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل في إلغاء الطلب');
    } finally {
      setCancelling(false);
    }
  };

  const handleRate = async () => {
    if (!errand) return;
    
    try {
      setRating(true);
      await rateErrand(errand._id, {
        driver: driverRating,
        service: serviceRating,
        comments: ratingComments.trim() || undefined,
      });
      setRatingDialogOpen(false);
      alert('شكراً لتقييمك!');
      fetchDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل في حفظ التقييم');
    } finally {
      setRating(false);
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
        }}
      />
    );
  };

  const formatDate = (date?: Date | string) => {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !errand) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'الطلب غير موجود'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders/errands')}
        >
          العودة للقائمة
        </Button>
      </Container>
    );
  }

  const canCancel = ['created', 'assigned'].includes(errand.status);
  const canRate = errand.status === 'delivered' && !errand.rating;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders/errands')}
          >
            رجوع
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {errand.orderNumber}
          </Typography>
          {getStatusChip(errand.status)}
        </Box>
        
        <Box display="flex" gap={2}>
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setCancelDialogOpen(true)}
            >
              إلغاء الطلب
            </Button>
          )}
          {canRate && (
            <Button
              variant="contained"
              startIcon={<StarIcon />}
              onClick={() => setRatingDialogOpen(true)}
            >
              تقييم الخدمة
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
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
                        {errand.errand.pickup.street && ` • ${errand.errand.pickup.street}`}
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
                        {errand.errand.dropoff.street && ` • ${errand.errand.dropoff.street}`}
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
                  <Typography fontWeight="bold">{errand.errand.category}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">الحجم:</Typography>
                  <Typography fontWeight="bold">{errand.errand.size}</Typography>
                </Box>
                {errand.errand.weightKg && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">الوزن:</Typography>
                    <Typography fontWeight="bold">{errand.errand.weightKg} كجم</Typography>
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
                  <Typography fontWeight="bold">{errand.deliveryFee} ريال</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">الإجمالي:</Typography>
                  <Typography fontWeight="bold" color="primary">
                    {errand.totalPrice} ريال
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">طريقة الدفع:</Typography>
                  <Typography fontWeight="bold">{errand.paymentMethod}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">تاريخ الطلب:</Typography>
                  <Typography>{formatDate(errand.createdAt)}</Typography>
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

        {/* Rating (if exists) */}
        {errand.rating && (
          <Grid  size={{xs: 12}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  التقييم
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid  size={{xs: 6}}>
                    <Typography color="textSecondary">تقييم السائق:</Typography>
                    <Rating value={errand.rating.driver} readOnly />
                  </Grid>
                  <Grid  size={{xs: 6}}>
                    <Typography color="textSecondary">تقييم الخدمة:</Typography>
                    <Rating value={errand.rating.service} readOnly />
                  </Grid>
                  {errand.rating.comments && (
                    <Grid  size={{xs: 12}}>
                      <Typography color="textSecondary">التعليقات:</Typography>
                      <Typography>{errand.rating.comments}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>إلغاء الطلب</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="سبب الإلغاء"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>إلغاء</Button>
          <Button
            onClick={handleCancel}
            color="error"
            disabled={!cancelReason.trim() || cancelling}
          >
            {cancelling ? <CircularProgress size={24} /> : 'تأكيد الإلغاء'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>تقييم الخدمة</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Typography gutterBottom>تقييم السائق:</Typography>
            <Rating
              value={driverRating}
              onChange={(_, value) => setDriverRating(value || 5)}
              size="large"
            />
            
            <Typography gutterBottom sx={{ mt: 2 }}>تقييم الخدمة:</Typography>
            <Rating
              value={serviceRating}
              onChange={(_, value) => setServiceRating(value || 5)}
              size="large"
            />
            
            <TextField
              margin="dense"
              label="تعليقات (اختياري)"
              fullWidth
              multiline
              rows={3}
              value={ratingComments}
              onChange={(e) => setRatingComments(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleRate} variant="contained" disabled={rating}>
            {rating ? <CircularProgress size={24} /> : 'إرسال التقييم'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ErrandDetailsPage;

