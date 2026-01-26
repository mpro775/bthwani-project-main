/**
 * Funnel Analysis Dashboard
 * لوحة تحليل قمع التحويل
 */

import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useConversionFunnel, useDropOffPoints } from '@/api/analytics-new';

export default function FunnelDashboard() {
  const { data: funnelData, loading: funnelLoading } = useConversionFunnel();
  const { data: dropOffData, loading: dropOffLoading } = useDropOffPoints();

  const loading = funnelLoading || dropOffLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const funnel = funnelData?.data || [];
  const dropOff = dropOffData?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        تحليل قمع التحويل
      </Typography>

      <Grid container spacing={3}>
        {/* Funnel Visualization */}
        <Grid  size={{xs: 12, md: 8}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                مراحل القمع
              </Typography>
              <Box sx={{ mt: 3 }}>
                {funnel.map((stage, index) => (
                  <Box key={stage.stage} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1">{stage.stage}</Typography>
                      <Typography variant="h6">{stage.count.toLocaleString()}</Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${stage.percentage}%`,
                          height: '100%',
                          bgcolor: `hsl(${220 - index * 20}, 70%, 50%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'width 0.5s ease',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {stage.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    {stage.dropOff > 0 && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        انسحاب: {stage.dropOff.toFixed(1)}%
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Drop-off Points */}
        <Grid  size={{xs: 12, md: 4}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                نقاط الانسحاب الرئيسية
              </Typography>
              {dropOff.map((point) => (
                <Box key={point.stage} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {point.stage}
                  </Typography>
                  <Typography variant="h5" color="error" sx={{ my: 1 }}>
                    {point.dropOffRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    اقتراحات للتحسين:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingRight: '20px' }}>
                    {point.suggestions.map((suggestion, idx) => (
                      <li key={idx}>
                        <Typography variant="caption">{suggestion}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

