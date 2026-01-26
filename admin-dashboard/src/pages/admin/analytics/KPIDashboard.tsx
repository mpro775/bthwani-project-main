/**
 * KPI Dashboard
 * لوحة مؤشرات الأداء الرئيسية
 */

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Speed,
} from '@mui/icons-material';
import { useKPIs, useRealTimeKPIs } from '@/api/analytics-new';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, value, change, trend, icon, color }: KPICardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return '#4caf50';
    if (trend === 'down') return '#f44336';
    return '#9e9e9e';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp />;
    if (trend === 'down') return <TrendingDown />;
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ my: 1 }}>
              {value}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {getTrendIcon()}
              <Typography
                variant="body2"
                sx={{ color: getTrendColor(), fontWeight: 'bold' }}
              >
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                مقارنة بالفترة السابقة
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function KPIDashboard() {
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: kpiData, loading: kpiLoading, error: kpiError } = useKPIs(dateRange);
  const { data: realTimeData, loading: realTimeLoading } = useRealTimeKPIs();

  const loading = kpiLoading || realTimeLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (kpiError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          خطأ في تحميل البيانات: {kpiError.message}
        </Alert>
      </Box>
    );
  }

  const kpis = kpiData?.data;
  const realTime = realTimeData?.data;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        مؤشرات الأداء الرئيسية (KPIs)
      </Typography>

      {/* Real-time Stats */}
      <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Speed sx={{ color: '#1976d2' }} />
            <Typography variant="h6">البيانات الحية</Typography>
            <Chip label="تحديث تلقائي" size="small" color="primary" />
          </Box>
          <Grid container spacing={2}>
            <Grid  size={{xs: 6, md: 3}}>
              <Typography variant="body2" color="text.secondary">
                مستخدمين نشطين الآن
              </Typography>
              <Typography variant="h5">{realTime?.activeUsers || 0}</Typography>
            </Grid>
            <Grid  size={{xs: 6, md: 3}}>
              <Typography variant="body2" color="text.secondary">
                طلبات نشطة
              </Typography>
              <Typography variant="h5">{realTime?.activeOrders || 0}</Typography>
            </Grid>
            <Grid  size={{xs: 6, md: 3}}>
              <Typography variant="body2" color="text.secondary">
                إيرادات اليوم
              </Typography>
              <Typography variant="h5">
                {realTime?.revenueToday?.toLocaleString() || 0} ريال
              </Typography>
            </Grid>
            <Grid  size={{xs: 6, md: 3}}>
              <Typography variant="body2" color="text.secondary">
                طلبات اليوم
              </Typography>
              <Typography variant="h5">{realTime?.ordersToday || 0}</Typography>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            آخر تحديث: {realTime?.lastUpdate ? new Date(realTime.lastUpdate).toLocaleTimeString('ar-SA') : '-'}
          </Typography>
        </CardContent>
      </Card>

      {/* Main KPIs */}
      <Grid container spacing={3}>
        {kpis?.revenue && (
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <KPICard
              title="الإيرادات"
              value={`${kpis.revenue.value.toLocaleString()} ريال`}
              change={kpis.revenue.change}
              trend={kpis.revenue.trend}
              icon={<AttachMoney sx={{ fontSize: 32, color: '#4caf50' }} />}
              color="#4caf50"
            />
          </Grid>
        )}

        {kpis?.orders && (
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <KPICard
              title="الطلبات"
              value={kpis.orders.value.toLocaleString()}
              change={kpis.orders.change}
              trend={kpis.orders.trend}
              icon={<ShoppingCart sx={{ fontSize: 32, color: '#2196f3' }} />}
              color="#2196f3"
            />
          </Grid>
        )}

        {kpis?.users && (
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <KPICard
              title="المستخدمين"
              value={kpis.users.value.toLocaleString()}
              change={kpis.users.change}
              trend={kpis.users.trend}
              icon={<People sx={{ fontSize: 32, color: '#9c27b0' }} />}
              color="#9c27b0"
            />
          </Grid>
        )}

        {kpis?.conversionRate && (
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <KPICard
              title="معدل التحويل"
              value={`${kpis.conversionRate.value.toFixed(2)}%`}
              change={kpis.conversionRate.change}
              trend={kpis.conversionRate.trend}
              icon={<TrendingUp sx={{ fontSize: 32, color: '#ff9800' }} />}
              color="#ff9800"
            />
          </Grid>
        )}

        {kpis?.averageOrderValue && (
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <KPICard
              title="متوسط قيمة الطلب"
              value={`${kpis.averageOrderValue.value.toFixed(2)} ريال`}
              change={kpis.averageOrderValue.change}
              trend={kpis.averageOrderValue.trend}
              icon={<AttachMoney sx={{ fontSize: 32, color: '#00bcd4' }} />}
              color="#00bcd4"
            />
          </Grid>
        )}

        {kpis?.customerLifetimeValue && (
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <KPICard
              title="القيمة الدائمة للعميل"
              value={`${kpis.customerLifetimeValue.value.toFixed(2)} ريال`}
              change={kpis.customerLifetimeValue.change}
              trend={kpis.customerLifetimeValue.trend}
              icon={<People sx={{ fontSize: 32, color: '#e91e63' }} />}
              color="#e91e63"
            />
          </Grid>
        )}
      </Grid>

      {/* Performance Indicators */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ملخص الأداء
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid  size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  أفضل مؤشر أداء
                </Typography>
                {kpis && (() => {
                  const metrics = [kpis.revenue, kpis.orders, kpis.users, kpis.conversionRate];
                  const best = metrics.filter(m => m).sort((a, b) => b!.change - a!.change)[0];
                  return best ? (
                    <>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {best.metric}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +{best.change.toFixed(1)}% تحسن
                      </Typography>
                    </>
                  ) : null;
                })()}
              </Box>
            </Grid>
              <Grid  size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  يحتاج انتباه
                </Typography>
                {kpis && (() => {
                  const metrics = [kpis.revenue, kpis.orders, kpis.users, kpis.conversionRate];
                  const worst = metrics.filter(m => m && m.trend === 'down').sort((a, b) => a!.change - b!.change)[0];
                  return worst ? (
                    <>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {worst.metric}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {worst.change.toFixed(1)}% انخفاض
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      جميع المؤشرات في حالة جيدة ✅
                    </Typography>
                  );
                })()}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

