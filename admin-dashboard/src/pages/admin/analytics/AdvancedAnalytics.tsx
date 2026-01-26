/**
 * Advanced Analytics Dashboard
 * لوحة التحليلات المتقدمة
 */

import { Box, Grid, Card, CardContent, Typography, CircularProgress,  Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import {
  useCustomerLTV,
  useChurnRate,
  useGeographicDistribution,
  usePeakHours,
  useProductPerformance,
  useDriverPerformance,
} from '@/api/analytics-new';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdvancedAnalytics() {
  const [tab, setTab] = useState(0);
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: ltvData, loading: ltvLoading } = useCustomerLTV();
  const { data: churnData, loading: churnLoading } = useChurnRate();
  const { data: geoData, loading: geoLoading } = useGeographicDistribution();
  const { data: peakData, loading: peakLoading } = usePeakHours();
  const { data: productData, loading: productLoading } = useProductPerformance(dateRange);
  const { data: driverData, loading: driverLoading } = useDriverPerformance(dateRange);

  const loading = ltvLoading || churnLoading || geoLoading || peakLoading || productLoading || driverLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        التحليلات المتقدمة
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="القيمة الدائمة والتراجع" />
          <Tab label="التوزيع الجغرافي" />
          <Tab label="ساعات الذروة" />
          <Tab label="أداء المنتجات" />
          <Tab label="أداء السائقين" />
        </Tabs>
      </Box>

      {/* Tab 1: LTV & Churn */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid  size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  القيمة الدائمة للعميل (LTV)
                </Typography>
                <Typography variant="h3" sx={{ my: 2 }}>
                  {ltvData?.data?.averageLTV?.toFixed(2) || 0} ريال
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  متوسط القيمة الدائمة للعميل
                </Typography>
                {ltvData?.data?.bySegment && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      حسب الشريحة:
                    </Typography>
                    {Object.entries(ltvData.data.bySegment).map(([segment, value]) => (
                      <Box key={segment} display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
                        <Typography variant="body2">{segment}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {value.toFixed(2)} ريال
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معدل التراجع (Churn Rate)
                </Typography>
                <Typography variant="h3" sx={{ my: 2, color: churnData?.data?.rate && churnData.data.rate > 10 ? '#f44336' : '#4caf50' }}>
                  {churnData?.data?.rate?.toFixed(2) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {churnData?.data?.churnedUsers || 0} من {churnData?.data?.totalUsers || 0} مستخدم
                </Typography>
                {churnData?.data?.reasons && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      أسباب التراجع:
                    </Typography>
                    {Object.entries(churnData.data.reasons).map(([reason, count]) => (
                      <Box key={reason} display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
                        <Typography variant="body2">{reason}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Geographic Distribution */}
      <TabPanel value={tab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              التوزيع الجغرافي للطلبات
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {geoData?.data?.data?.map((region) => (
                <Grid  size={{xs: 12, sm: 6, md: 4}} key={region.region}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {region.region}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 1 }}>
                      {region.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {region.percentage.toFixed(1)}% من الإجمالي
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Peak Hours */}
      <TabPanel value={tab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ساعات الذروة
            </Typography>
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'right' }}>الساعة</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>عدد الطلبات</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>الإيرادات</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>متوسط قيمة الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {peakData?.data?.map((hour) => (
                    <tr key={hour.hour} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>
                        {hour.hour}:00 - {hour.hour + 1}:00
                      </td>
                      <td style={{ padding: '12px' }}>{hour.orders}</td>
                      <td style={{ padding: '12px' }}>{hour.revenue.toLocaleString()} ريال</td>
                      <td style={{ padding: '12px' }}>{hour.averageOrderValue.toFixed(2)} ريال</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Product Performance */}
      <TabPanel value={tab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              أداء المنتجات
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {productData?.data?.slice(0, 12).map((product) => (
                <Grid  size={{xs: 12, sm: 6, md: 4}} key={product.productId}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {product.productName}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        طلبات:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {product.totalOrders}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        إيرادات:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {product.totalRevenue.toLocaleString()} ريال
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        تقييم:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ⭐ {product.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 5: Driver Performance */}
      <TabPanel value={tab} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              أداء السائقين
            </Typography>
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'right' }}>السائق</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>التوصيلات</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>معدل الإكمال</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>التقييم</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>الأرباح</th>
                  </tr>
                </thead>
                <tbody>
                  {driverData?.data?.slice(0, 20).map((driver) => (
                    <tr key={driver.driverId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>{driver.driverName}</td>
                      <td style={{ padding: '12px' }}>{driver.totalDeliveries}</td>
                      <td style={{ padding: '12px' }}>
                        <Typography
                          component="span"
                          sx={{ color: driver.completionRate > 90 ? '#4caf50' : '#f44336' }}
                        >
                          {driver.completionRate.toFixed(1)}%
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>⭐ {driver.averageRating.toFixed(1)}</td>
                      <td style={{ padding: '12px' }}>{driver.totalEarnings.toLocaleString()} ريال</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

