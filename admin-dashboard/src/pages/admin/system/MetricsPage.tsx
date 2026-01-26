/**
 * Metrics Dashboard
 */

import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useJsonMetrics } from '@/api/metrics';

export default function MetricsPage() {
  const { data: metrics, loading } = useJsonMetrics();

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
        مقاييس الأداء (Metrics)
      </Typography>

      <Grid container spacing={3}>
        {/* HTTP Metrics */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>HTTP Requests</Typography>
              <Typography>Total: {metrics?.http.requests_total || 0}</Typography>
              <Typography>Errors: {metrics?.http.requests_errors_total || 0}</Typography>
              <Typography>Duration: {metrics?.http.requests_duration_seconds || 0}s</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Metrics */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cache</Typography>
              <Typography>Hits: {metrics?.cache.hits_total || 0}</Typography>
              <Typography>Misses: {metrics?.cache.misses_total || 0}</Typography>
              <Typography>Hit Rate: {((metrics?.cache.hit_rate || 0) * 100).toFixed(1)}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Queue Metrics */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Queues</Typography>
              <Typography>Waiting: {metrics?.queues.jobs_waiting || 0}</Typography>
              <Typography>Active: {metrics?.queues.jobs_active || 0}</Typography>
              <Typography>Completed: {metrics?.queues.jobs_completed || 0}</Typography>
              <Typography>Failed: {metrics?.queues.jobs_failed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Metrics */}
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Memory</Typography>
              <Typography>Heap Used: {Math.round((metrics?.nodejs.heap_used_bytes || 0) / 1024 / 1024)} MB</Typography>
              <Typography>Heap Total: {Math.round((metrics?.nodejs.heap_total_bytes || 0) / 1024 / 1024)} MB</Typography>
              <Typography>RSS: {Math.round((metrics?.nodejs.rss_bytes || 0) / 1024 / 1024)} MB</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

