import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { getMyErrands, type ErrandOrder } from '../../api/akhdimni';

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

const MyErrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const [errands, setErrands] = useState<ErrandOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchErrands = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyErrands(status);
      setErrands(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrands(statusFilter);
  }, [statusFilter]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue === 'all' ? undefined : newValue);
  };

  const getStatusChip = (status: string) => {
    const label = ERRAND_STATUS_LABELS[status] || status;
    const color = ERRAND_STATUS_COLORS[status] || '#6c757d';
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: color,
          color: '#fff',
          fontWeight: 'bold',
        }}
      />
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('ar-YE', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          طلباتي من أخدمني
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchErrands(statusFilter)}
        >
          تحديث
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={statusFilter || 'all'}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="الكل" value="all" />
          <Tab label="جديدة" value="created" />
          <Tab label="معينة" value="assigned" />
          <Tab label="قيد التنفيذ" value="picked_up" />
          <Tab label="مكتملة" value="delivered" />
          <Tab label="ملغاة" value="cancelled" />
        </Tabs>
      </Card>

      {/* Errands Grid */}
      <Grid container spacing={3}>
        {errands.map((errand) => (
          <Grid  size={{xs: 12, md: 6, lg: 4}} key={errand._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {errand.orderNumber}
                  </Typography>
                  {getStatusChip(errand.status)}
                </Box>

                <Box display="flex" alignItems="start" mb={2}>
                  <PlaceIcon sx={{ color: '#0d6efd', mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      الاستلام
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {errand.errand.pickup.label || errand.errand.pickup.city || '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="start" mb={2}>
                  <PlaceIcon sx={{ color: '#198754', mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      التسليم
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {errand.errand.dropoff.label || errand.errand.dropoff.city || '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      المسافة
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {errand.errand.distanceKm.toFixed(1)} كم
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      الرسوم
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {errand.deliveryFee} ر.ي
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="textSecondary">
                  {formatDate(errand.createdAt)}
                </Typography>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/orders/errands/${errand._id}`)}
                >
                  التفاصيل
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {!loading && errands.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            لا توجد طلبات
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            ليس لديك طلبات أخدمني حالياً
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/akhdimni')}
          >
            إنشاء طلب جديد
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MyErrandsPage;

