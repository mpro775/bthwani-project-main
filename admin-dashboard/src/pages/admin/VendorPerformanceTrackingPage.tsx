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
  Tooltip,

  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,

} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import {
  getVendorStats,
  getVendorPerformance,
  getVendorSalesData,
  getVendors,
  type VendorDetails
} from '../../api/vendors';

// ملاحظة: تم تعديل getVendorStats لتقبل فلاتر عامة فقط بدون id

const VendorPerformanceDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  vendor: VendorDetails | null;
}> = ({ open, onClose, vendor }) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartData, setChartData] = useState<{ labels: string[]; sales: number[]; orders: number[] } | null>(null);

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['vendorPerformance', vendor?._id, period],
    queryFn: () => vendor ? getVendorPerformance(vendor._id, { period }) : Promise.resolve(null),
    enabled: !!vendor && open,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['vendorSalesData', vendor?._id, period],
    queryFn: () => vendor ? getVendorSalesData(vendor._id, { period: period as 'week' | 'month' | 'quarter' }) : Promise.resolve(null),
    enabled: !!vendor && open,
  });

  React.useEffect(() => {
    if (salesData) {
      setChartData(salesData);
    }
  }, [salesData]);

  if (!vendor) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPerformanceColor = (value: number, type: 'sales' | 'orders' | 'rating') => {
    if (type === 'rating') {
      if (value >= 4.5) return 'success';
      if (value >= 4.0) return 'warning';
      return 'error';
    }
    return value > 0 ? 'success' : 'error';
  };

  const getPerformanceIcon = (value: number, type: 'sales' | 'orders' | 'rating') => {
    if (type === 'rating') {
      return <StarIcon />;
    }
    return value > 0 ? <TrendingIcon /> : <TrendingIcon sx={{ transform: 'rotate(180deg)' }} />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        تفاصيل أداء التاجر: {vendor.fullName}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Period Selector */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">الفترة:</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                label="الفترة"
              >
                <MenuItem value="week">أسبوع</MenuItem>
                <MenuItem value="month">شهر</MenuItem>
                <MenuItem value="quarter">ربع سنة</MenuItem>
                <MenuItem value="year">سنة</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {performanceLoading || salesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Vendor Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      معلومات التاجر
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">الاسم:</Typography>
                        <Typography variant="body2">{vendor.fullName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">الهاتف:</Typography>
                        <Typography variant="body2">{vendor.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">المتجر:</Typography>
                        <Typography variant="body2">{vendor.store.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">الحالة:</Typography>
                        <Chip
                          label={vendor.isActive ? 'نشط' : 'غير نشط'}
                          color={vendor.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Metrics */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      مؤشرات الأداء
                    </Typography>
                    {performanceData && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">إجمالي المبيعات:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getPerformanceIcon(performanceData.totalSales, 'sales')}
                              <Typography variant="body2" color={getPerformanceColor(performanceData.totalSales, 'sales')}>
                                {formatCurrency(performanceData.totalSales)}
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((performanceData.totalSales / 10000) * 100, 100)}
                            color={getPerformanceColor(performanceData.totalSales, 'sales')}
                          />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">عدد الطلبات:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getPerformanceIcon(performanceData.totalOrders, 'orders')}
                              <Typography variant="body2" color={getPerformanceColor(performanceData.totalOrders, 'orders')}>
                                {performanceData.totalOrders}
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((performanceData.totalOrders / 50) * 100, 100)}
                            color={getPerformanceColor(performanceData.totalOrders, 'orders')}
                          />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">متوسط قيمة الطلب:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getPerformanceIcon(performanceData.averageOrderValue, 'sales')}
                              <Typography variant="body2" color={getPerformanceColor(performanceData.averageOrderValue, 'sales')}>
                                {formatCurrency(performanceData.averageOrderValue)}
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((performanceData.averageOrderValue / 100) * 100, 100)}
                            color={getPerformanceColor(performanceData.averageOrderValue, 'sales')}
                          />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">معدل التحويل:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getPerformanceIcon(performanceData.conversionRate, 'sales')}
                              <Typography variant="body2" color={getPerformanceColor(performanceData.conversionRate, 'sales')}>
                                {performanceData.conversionRate.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={performanceData.conversionRate}
                            color={getPerformanceColor(performanceData.conversionRate, 'sales')}
                          />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">رضا العملاء:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getPerformanceIcon(performanceData.customerSatisfaction, 'rating')}
                              <Typography variant="body2" color={getPerformanceColor(performanceData.customerSatisfaction, 'rating')}>
                                {performanceData.customerSatisfaction.toFixed(1)}/5
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(performanceData.customerSatisfaction / 5) * 100}
                            color={getPerformanceColor(performanceData.customerSatisfaction, 'rating')}
                          />
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Chart Section */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تحليل المبيعات والطلبات
                    </Typography>
                    {chartData && (
                      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          رسم بياني للمبيعات والطلبات (سيتم إضافته لاحقاً)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function VendorPerformanceTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'sales' | 'orders' | 'rating' | 'name'>('sales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVendor, setSelectedVendor] = useState<VendorDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch vendors
  const { data: vendorsData, isLoading, error } = useQuery({
    queryKey: ['vendors', cursor, statusFilter, searchTerm],
    queryFn: () => getVendors({
      cursor: cursor || undefined,
      limit: 50,
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      search: searchTerm || undefined,
    }),
  });

  // Fetch vendor statistics (بدون تمرير id)
  const { data: stats } = useQuery({
    queryKey: ['vendorStats'],
    queryFn: () => getVendorStats(), // يرسل بدون id
  });

  const handleViewDetails = (vendor: VendorDetails) => {
    setSelectedVendor(vendor);
    setDetailsDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      // Export functionality would be implemented here
      console.log('Export vendors data');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const vendors = vendorsData?.data || [];
  const pagination = vendorsData?.pagination;

  const filteredVendors = vendors.filter((vendor: VendorDetails) => {
    const matchesSearch =
      vendor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone.includes(searchTerm) ||
      vendor.store.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'sales':
        aValue = a.totalRevenue;
        bValue = b.totalRevenue;
        break;
      case 'orders':
        aValue = a.salesCount;
        bValue = b.salesCount;
        break;
      case 'rating':
        aValue = a.averageRating || 0;
        bValue = b.averageRating || 0;
        break;
      default:
        aValue = a.fullName;
        bValue = b.fullName;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    const aNum = Number(aValue);
    const bNum = Number(bValue);
    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
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

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'default';
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'warning';
    return 'error';
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل بيانات التجار: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          تتبع أداء التجار
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            تصدير
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['vendors'] })}
          >
            تحديث
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalVendors}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي التجار
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
                  <TrendingIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.activeVendors}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تجار نشطين
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
                  <MoneyIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalSales)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المبيعات
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
                  <CartIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.averageOrderValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط الطلب
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
              placeholder="البحث في التجار..."
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
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="inactive">غير نشط</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>ترتيب حسب</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'sales' | 'orders' | 'rating' | 'name')}
                label="ترتيب حسب"
              >
                <MenuItem value="name">الاسم</MenuItem>
                <MenuItem value="sales">المبيعات</MenuItem>
                <MenuItem value="orders">الطلبات</MenuItem>
                <MenuItem value="rating">التقييم</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>الترتيب</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                label="الترتيب"
              >
                <MenuItem value="desc">تنازلي</MenuItem>
                <MenuItem value="asc">تصاعدي</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${sortedVendors.length} تاجر`}
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
                  <TableCell>التاجر</TableCell>
                  <TableCell>المتجر</TableCell>
                  <TableCell>المبيعات</TableCell>
                  <TableCell>عدد الطلبات</TableCell>
                  <TableCell>التقييم</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ الانضمام</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedVendors.map((vendor) => (
                  <TableRow key={vendor._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {vendor.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vendor.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {vendor.store.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vendor.store.address}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {formatCurrency(vendor.totalRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {vendor.salesCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {vendor.averageRating ? (
                        <Chip
                          label={`${vendor.averageRating.toFixed(1)}/5`}
                          color={getRatingColor(vendor.averageRating)}
                          size="small"
                          icon={<StarIcon />}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">لا يوجد</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vendor.isActive ? 'نشط' : 'غير نشط'}
                        color={vendor.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(vendor.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="عرض تفاصيل الأداء">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(vendor)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Pagination */}
      {pagination && (pagination.hasMore || cursor) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={!cursor}
            onClick={() => setCursor(null)}
          >
            البداية
          </Button>

          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            {vendors.length} تاجر {pagination.hasMore ? '(المزيد متاح)' : ''}
          </Typography>

          <Button
            variant="outlined"
            disabled={!pagination.hasMore}
            onClick={() => pagination.nextCursor && setCursor(pagination.nextCursor)}
          >
            التالي
          </Button>
        </Box>
      )}

      {sortedVendors.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا يوجد تجار</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'لا يوجد تجار لعرضهم'
            }
          </Typography>
        </Box>
      )}

      {/* Vendor Performance Dialog */}
      <VendorPerformanceDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
      />
    </Box>
  );
}
