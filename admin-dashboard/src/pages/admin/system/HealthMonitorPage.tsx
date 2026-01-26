/**
 * Health Monitor Dashboard
 */

import { Box, Grid, Card, CardContent, Typography, Chip, CircularProgress } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useHealthCheck, useHealthMetrics, useDetailedHealth, useAppInfo } from '@/api/health';

export default function HealthMonitorPage() {
  const { data: health, loading: healthLoading } = useHealthCheck();
  const { data: metrics } = useHealthMetrics();
  const { data: detailed } = useDetailedHealth();
  const { data: info } = useAppInfo();

  if (healthLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        مراقبة صحة النظام
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Status */}
          <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                {health?.status === 'ok' ? (
                  <CheckCircle sx={{ fontSize: 48, color: '#4caf50' }} />
                ) : (
                  <Error sx={{ fontSize: 48, color: '#f44336' }} />
                )}
                <Box>
                  <Typography variant="h5">
                    {health?.status === 'ok' ? 'النظام يعمل بشكل سليم' : 'النظام يعاني من مشاكل'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    آخر فحص: {new Date().toLocaleString('ar-SA')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics */}
        {metrics && (
          <>
            <Grid  size={{xs: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">قاعدة البيانات</Typography>
                  <Chip
                    label={metrics.database.connected ? 'متصل' : 'غير متصل'}
                    color={metrics.database.connected ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

                <Grid  size={{xs: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">الذاكرة المستخدمة</Typography>
                  <Typography variant="h5">{metrics.memory.heapUsedPercent}%</Typography>
                  <Typography variant="caption">{metrics.memory.heapUsedMB} MB</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Uptime</Typography>
                  <Typography variant="h5">{Math.floor(metrics.uptime / 60)} دقيقة</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">الحالة العامة</Typography>
                  <Chip
                    label={metrics.status}
                    color={metrics.status === 'healthy' ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Detailed Info */}
        {detailed && (
          <Grid  size={{xs: 12}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>معلومات تفصيلية</Typography>
                <Grid container spacing={2}>
                  <Grid  size={{xs: 12, md: 6}}>
                    <Typography variant="subtitle2">البيئة:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailed.environment.nodeEnv} - {detailed.environment.platform}
                    </Typography>
                  </Grid>
                  <Grid  size={{xs: 12, md: 6}}>
                    <Typography variant="subtitle2">Node Version:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailed.environment.nodeVersion}
                    </Typography>
                  </Grid>
                  <Grid  size={{xs: 12, md: 6}}>
                    <Typography variant="subtitle2">Database:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailed.database.name} - {detailed.database.collections} collections
                    </Typography>
                  </Grid>
                  <Grid  size={{xs: 12, md: 6}}>
                    <Typography variant="subtitle2">CPU:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailed.cpu.total} {detailed.cpu.unit}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* App Info */}
        {info && (
          <Grid  size={{xs: 12}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>معلومات التطبيق</Typography>
                <Grid container spacing={2}>
                    <Grid  size={{xs: 12, md: 4}}>
                    <Typography variant="subtitle2">الاسم:</Typography>
                    <Typography variant="body2">{info.name}</Typography>
                  </Grid>
                  <Grid  size={{xs: 12, md: 4}}>
                    <Typography variant="subtitle2">الإصدار:</Typography>
                    <Typography variant="body2">{info.version}</Typography>
                  </Grid>
                  <Grid  size={{xs: 12, md: 4}}>
                    <Typography variant="subtitle2">Uptime:</Typography>
                    <Typography variant="body2">{info.uptime}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

