/**
 * Users Analytics Dashboard
 * لوحة تحليلات المستخدمين
 */

import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useUserGrowth, useUserRetention } from '@/api/analytics-new';

export default function UsersDashboard() {
  const { data: growthData, loading: growthLoading } = useUserGrowth({ period: 'monthly' });
  const { data: retentionData, loading: retentionLoading } = useUserRetention();

  const loading = growthLoading || retentionLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const growth = growthData?.data || [];
  const retention = retentionData?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        تحليلات المستخدمين
      </Typography>

      <Grid container spacing={3}>
        {/* User Growth */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                نمو المستخدمين
              </Typography>
              <Box sx={{ overflowX: 'auto', mt: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الفترة</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>إجمالي المستخدمين</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>مستخدمين جدد</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>مستخدمين نشطين</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>معدل النمو</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growth.map((item) => (
                      <tr key={item.period} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px' }}>{item.period}</td>
                        <td style={{ padding: '12px' }}>{item.totalUsers.toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>{item.newUsers.toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>{item.activeUsers.toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          <Typography
                            component="span"
                            sx={{
                              color: item.growthRate > 0 ? '#4caf50' : '#f44336',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.growthRate > 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Retention */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معدل الاحتفاظ بالمستخدمين
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {retention.map((item) => (
                  <Grid  size={{xs: 12, sm: 6, md: 3}} key={item.period}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.period}
                      </Typography>
                      <Typography variant="h4" sx={{ my: 1 }}>
                        {item.retentionRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.retained} من {item.cohortSize}
                      </Typography>
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

