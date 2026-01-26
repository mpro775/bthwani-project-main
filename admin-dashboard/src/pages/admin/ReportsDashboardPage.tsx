import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  LocalShipping as DeliveryIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,

  ShowChart as ChartIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getSystemOverview,
  getFinancialSummary,
  getOrderAnalytics,
  getUserAnalytics,
  getVendorAnalytics,
  getDriverAnalytics,
  getRealtimeMetrics,

  type ReportFilter,
  type FinancialSummary,
  type OrderAnalytics,
  type UserAnalytics,
  type VendorAnalytics,
  type DriverAnalytics
} from '../../api/reports';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TrendingIcon
            sx={{
              color: trend.isPositive ? 'success.main' : 'error.main',
              transform: trend.isPositive ? 'none' : 'rotate(180deg)',
              mr: 0.5
            }}
            fontSize="small"
          />
          <Typography
            variant="body2"
            sx={{
              color: trend.isPositive ? 'success.main' : 'error.main',
              fontWeight: 'medium'
            }}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const QuickStatsCard: React.FC<{
  title: string;
  data: FinancialSummary | OrderAnalytics | UserAnalytics | VendorAnalytics | DriverAnalytics;
  type: 'financial' | 'orders' | 'users' | 'vendors' | 'drivers';
}> = ({ title, data, type }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderContent = () => {
    switch (type) {
      case 'financial':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="success.main">
              {formatCurrency((data as FinancialSummary).totalRevenue * 10000)} ر.ي
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي الإيرادات
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                صافي الربح:
              </Typography>
              <Typography variant="body2" color="success.main">
                {formatCurrency((data as FinancialSummary).netProfit)} ر.ي
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                المستوطنات المعلقة:
              </Typography>
              <Typography variant="body2" color="warning.main">
                {(data as FinancialSummary).pendingSettlements}
              </Typography>
            </Box>
          </Box>
        );

      case 'orders':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="primary.main">
              {(data as OrderAnalytics).totalOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي الطلبات
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                متوسط القيمة:
              </Typography>
              <Typography variant="body2" color="primary.main">
                {formatCurrency((data as OrderAnalytics).averageOrderValue)} ر.ي
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                مكتملة:
              </Typography>
              <Typography variant="body2" color="success.main">
                {(data as OrderAnalytics).completedOrders}
              </Typography>
            </Box>
          </Box>
        );

      case 'users':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="info.main">
              {(data as UserAnalytics).totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي المستخدمين
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                مستخدمين نشطين:
              </Typography>
              <Typography variant="body2" color="success.main">
                {(data as UserAnalytics).activeUsers}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                مستخدمين جدد:
              </Typography>
              <Typography variant="body2" color="info.main">
                {(data as UserAnalytics).newUsers}
              </Typography>
            </Box>
          </Box>
        );

      case 'vendors':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="warning.main">
              {(data as VendorAnalytics).totalVendors}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي التجار
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                تجار نشطين:
              </Typography>
              <Typography variant="body2" color="success.main">
                {(data as VendorAnalytics).activeVendors}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                متوسط التقييم:
              </Typography>
              <Typography variant="body2" color="warning.main">
                {(data as VendorAnalytics).averageVendorRating?.toFixed(1)}/5
              </Typography>
            </Box>
          </Box>
        );

      case 'drivers':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="secondary.main">
              {(data as DriverAnalytics).totalDrivers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي السائقين
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                سائقين نشطين:
              </Typography>
              <Typography variant="body2" color="success.main">
                {(data as DriverAnalytics).activeDrivers}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
              توصيلات مكتملة:
              </Typography>
              <Typography variant="body2" color="secondary.main">
                {(data as DriverAnalytics).completedDeliveries}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'grey.100', color: 'text.primary' }}>
            {type === 'financial' && <MoneyIcon />}
            {type === 'orders' && <ChartIcon />}
            {type === 'users' && <PeopleIcon />}
            {type === 'vendors' && <StoreIcon />}
            {type === 'drivers' && <DeliveryIcon />}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default function ReportsDashboardPage() {
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(dayjs().subtract(30, 'day'));
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(dayjs());
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const filters: ReportFilter = {
    dateRange: {
      from: dateFrom?.format('YYYY-MM-DD') || dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      to: dateTo?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
    },
    period,
  };

  // Fetch system overview
  const { data: systemOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['systemOverview', filters],
    queryFn: () => getSystemOverview(filters),
  });

  // Fetch financial summary
  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ['financialSummary', filters],
    queryFn: () => getFinancialSummary(filters),
  });

  // Fetch order analytics
  const { data: orderAnalytics, isLoading: ordersLoading } = useQuery({
    queryKey: ['orderAnalytics', filters],
    queryFn: () => getOrderAnalytics(filters),
  });

  // Fetch user analytics
  const { data: userAnalytics, isLoading: usersLoading } = useQuery({
    queryKey: ['userAnalytics', filters],
    queryFn: () => getUserAnalytics(filters),
  });

  // Fetch vendor analytics
  const { data: vendorAnalytics, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendorAnalytics', filters],
    queryFn: () => getVendorAnalytics(filters),
  });

  // Fetch driver analytics
  const { data: driverAnalytics, isLoading: driversLoading } = useQuery({
    queryKey: ['driverAnalytics', filters],
    queryFn: () => getDriverAnalytics(filters),
  });

  // Fetch real-time metrics
  const { data: realtimeMetrics } = useQuery({
    queryKey: ['realtimeMetrics'],
    queryFn: getRealtimeMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const isLoading = overviewLoading || financialLoading || ordersLoading || usersLoading || vendorsLoading || driversLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      // Export functionality would be implemented here
      console.log('Export comprehensive report');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          لوحة التقارير والتحليلات
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            تصدير التقرير
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
          >
            تحديث البيانات
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="من تاريخ"
                value={dateFrom}
                onChange={setDateFrom}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 },
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="إلى تاريخ"
                value={dateTo}
                onChange={setDateTo}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 },
                  },
                }}
              />
            </LocalizationProvider>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>الفترة</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                label="الفترة"
              >
                <MenuItem value="daily">يومي</MenuItem>
                <MenuItem value="weekly">أسبوعي</MenuItem>
                <MenuItem value="monthly">شهري</MenuItem>
                <MenuItem value="quarterly">ربع سنوي</MenuItem>
                <MenuItem value="yearly">سنوي</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`الفترة: ${filters.dateRange.from} - ${filters.dateRange.to}`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      {realtimeMetrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="المستخدمين النشطين"
              value={realtimeMetrics.activeUsers}
              icon={<PeopleIcon />}
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="الطلبات الحالية"
              value={realtimeMetrics.currentOrders}
              icon={<ChartIcon />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="الإيرادات اليوم"
              value={`${formatCurrency(realtimeMetrics.revenueToday)} ر.ي`}
              icon={<MoneyIcon />}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="حالة النظام"
              value={
                realtimeMetrics.systemHealth === 'healthy' ? 'سليم' :
                realtimeMetrics.systemHealth === 'warning' ? 'تحذير' : 'حرج'
              }
              icon={<AnalyticsIcon />}
              color={
                realtimeMetrics.systemHealth === 'healthy' ? 'success' :
                realtimeMetrics.systemHealth === 'warning' ? 'warning' : 'error'
              }
            />
          </Grid>
        </Grid>
      )}

      {/* Main Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          {financialSummary && (
            <QuickStatsCard
              title="الملخص المالي"
              data={financialSummary}
              type="financial"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          {orderAnalytics && (
            <QuickStatsCard
              title="إحصائيات الطلبات"
              data={orderAnalytics}
              type="orders"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          {userAnalytics && (
            <QuickStatsCard
              title="المستخدمين"
              data={userAnalytics}
              type="users"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          {vendorAnalytics && (
            <QuickStatsCard
              title="التجار"
              data={vendorAnalytics}
              type="vendors"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          {driverAnalytics && (
            <QuickStatsCard
              title="السائقين"
              data={driverAnalytics}
              type="drivers"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                نظرة عامة على النظام
              </Typography>
              {systemOverview && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المستخدمين:
                    </Typography>
                    <Typography variant="body2" color="primary.main">
                      {systemOverview.totalUsers}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الطلبات:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {systemOverview.totalOrders}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الإيرادات:
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      {formatCurrency(systemOverview.totalRevenue)} ر.ي
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      النمو الشهري:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: systemOverview.monthlyGrowth > 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {systemOverview.monthlyGrowth > 0 ? '+' : ''}{systemOverview.monthlyGrowth}%
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performers */}
      <Grid container spacing={3}>
        {/* Top Stores */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                أفضل المتاجر أداءً
              </Typography>
              {orderAnalytics?.topStores && orderAnalytics.topStores.length > 0 ? (
                <List dense>
                  {orderAnalytics.topStores.slice(0, 5).map((store, index) => (
                    <ListItem key={store.storeId}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={store.storeName}
                        secondary={`${store.orderCount} طلب - ${formatCurrency(store.revenue)} ر.ي`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات متاحة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Users */}
            <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                أفضل العملاء
              </Typography>
              {userAnalytics?.topUsersByOrders && userAnalytics.topUsersByOrders.length > 0 ? (
                <List dense>
                  {userAnalytics.topUsersByOrders.slice(0, 5).map((user, index) => (
                    <ListItem key={user.userId}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={user.userName}
                        secondary={`${user.orderCount} طلب - ${formatCurrency(user.totalSpent)} ر.ي`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات متاحة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
