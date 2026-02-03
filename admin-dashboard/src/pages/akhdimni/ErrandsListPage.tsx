import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  getAllErrands,
  getErrandsStats,
  ERRAND_STATUS_LABELS,
  ERRAND_STATUS_COLORS,
  ERRAND_CATEGORIES,
  ERRAND_SIZES,
} from '../../api/akhdimni';
import type { ErrandOrder } from '../../api/akhdimni';

const ErrandsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [errands, setErrands] = useState<ErrandOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<any>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  const fetchErrands = async (status?: string, nextCursor?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllErrands({
        status,
        cursor: nextCursor,
        limit: 20,
      });
      setErrands(response.data);
      setCursor(response.pagination.nextCursor || undefined);
      setHasMore(response.pagination.hasMore);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getErrandsStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchErrands(statusFilter);
    fetchStats();
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ar-YE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !errands.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          إدارة أخدمني
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

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي الطلبات
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  المكتملة
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {stats.byStatus?.delivered || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  الإيرادات الكلية
                </Typography>
                <Typography variant="h4" component="div">
                  {Math.round(stats.totalRevenue)} ر.ي
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  متوسط الرسوم
                </Typography>
                <Typography variant="h4" component="div">
                  {Math.round(stats.avgDeliveryFee)} ر.ي
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={statusFilter || 'all'}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="الكل" value="all" />
          <Tab label="جديدة" value="created" />
          <Tab label="معينة" value="assigned" />
          <Tab label="تم الاستلام" value="picked_up" />
          <Tab label="في الطريق" value="in_transit" />
          <Tab label="مكتملة" value="delivered" />
          <Tab label="ملغاة" value="cancelled" />
        </Tabs>
      </Card>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>رقم الطلب</TableCell>
              <TableCell>العميل</TableCell>
              <TableCell>السائق</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>النوع</TableCell>
              <TableCell>المسافة</TableCell>
              <TableCell>الرسوم</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errands.map((errand) => (
              <TableRow key={errand._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {errand.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {errand.user?.fullName || 'غير متوفر'}
                  </Typography>
                  {errand.user?.phone && (
                    <Typography variant="caption" color="textSecondary">
                      {errand.user.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {errand.driver ? (
                    <>
                      <Typography variant="body2">
                        {errand.driver.fullName}
                      </Typography>
                      {errand.driver.phone && (
                        <Typography variant="caption" color="textSecondary">
                          {errand.driver.phone}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      لم يُعين بعد
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{getStatusChip(errand.status)}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {(ERRAND_CATEGORIES[errand.errand?.category] ||
                      errand.errand?.category) ?? '—'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {(ERRAND_SIZES[errand.errand?.size] || errand.errand?.size) ?? '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(Number(errand.errand?.distanceKm ?? 0)).toFixed(1)} كم
                </TableCell>
                <TableCell>{errand.deliveryFee ?? '—'} ر.ي</TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDate(errand.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/akhdimni/${errand._id}`)}
                  >
                    التفاصيل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Load More */}
      {hasMore && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="outlined"
            onClick={() => fetchErrands(statusFilter, cursor)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'تحميل المزيد'}
          </Button>
        </Box>
      )}

      {/* Empty State */}
      {!loading && errands.length === 0 && (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="textSecondary">
            لا توجد طلبات حالياً
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ErrandsListPage;

