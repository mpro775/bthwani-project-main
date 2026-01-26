/**
 * Revenue Analytics Dashboard
 * لوحة تحليلات الإيرادات
 */

import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useRevenueForecast, useRevenueBreakdown } from '@/api/analytics-new';

export default function RevenueDashboard() {
  const { data: forecastData, loading: forecastLoading } = useRevenueForecast();
  const { data: breakdownData, loading: breakdownLoading } = useRevenueBreakdown();

  const loading = forecastLoading || breakdownLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const forecast = forecastData?.data || [];
  const breakdown = breakdownData?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        تحليلات وتوقعات الإيرادات
      </Typography>

      <Grid container spacing={3}>
        {/* Revenue Forecast */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                توقعات الإيرادات
              </Typography>
              <Box sx={{ overflowX: 'auto', mt: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الفترة</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الإيرادات المتوقعة</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الثقة</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الحد الأدنى</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الحد الأقصى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((item) => (
                      <tr key={item.period} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px' }}>{item.period}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>
                          {item.predicted.toLocaleString()} ريال
                        </td>
                        <td style={{ padding: '12px' }}>
                          <Typography
                            component="span"
                            sx={{
                              color: item.confidence > 80 ? '#4caf50' : item.confidence > 60 ? '#ff9800' : '#f44336',
                            }}
                          >
                            {item.confidence.toFixed(0)}%
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', color: '#9e9e9e' }}>
                          {item.lowerBound.toLocaleString()} ريال
                        </td>
                        <td style={{ padding: '12px', color: '#9e9e9e' }}>
                          {item.upperBound.toLocaleString()} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Breakdown */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                تفصيل الإيرادات حسب الفئة
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {breakdown.map((item) => (
                  <Grid  size={{xs: 12, sm: 6, md: 4}} key={item.category}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {item.category}
                      </Typography>
                      <Typography variant="h5" sx={{ my: 1 }}>
                        {item.amount.toLocaleString()} ريال
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {item.percentage.toFixed(1)}% من الإجمالي
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: item.change > 0 ? '#4caf50' : '#f44336',
                          }}
                        >
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

