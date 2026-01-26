/**
 * Reconciliations Manager
 * إدارة المطابقات المالية
 */

import { Box, Card, CardContent, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { useReconciliations } from '@/api/finance-new';

export default function ReconciliationsPage() {
  const { data, loading, error } = useReconciliations();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">خطأ: {error.message}</Alert>
      </Box>
    );
  }

  const reconciliations = data?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        المطابقات المالية
      </Typography>

      {reconciliations.map((recon) => (
        <Card key={recon.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">
                  {new Date(recon.periodStart).toLocaleDateString('ar-SA')} - {new Date(recon.periodEnd).toLocaleDateString('ar-SA')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recon.periodType} | {recon.issues.length} مشاكل
                </Typography>
              </Box>
              <Chip
                label={recon.status}
                color={
                  recon.status === 'completed' ? 'success' :
                  recon.status === 'in_progress' ? 'primary' :
                  recon.status === 'failed' ? 'error' : 'default'
                }
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

