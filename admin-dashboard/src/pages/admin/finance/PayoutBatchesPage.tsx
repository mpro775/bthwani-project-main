/**
 * Payout Batches Manager
 * إدارة دفعات دفع العمولات
 */

import { Box, Card, CardContent, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { usePayoutBatches } from '@/api/finance-new';

export default function PayoutBatchesPage() {
  const { data, loading, error } = usePayoutBatches();

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

  const batches = data?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        دفعات دفع العمولات
      </Typography>

      {batches.map((batch) => (
        <Card key={batch.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{batch.batchNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {batch.itemsCount} عنصر - {batch.totalAmount.toLocaleString()} ريال
                </Typography>
              </Box>
              <Chip
                label={batch.status}
                color={
                  batch.status === 'completed' ? 'success' :
                  batch.status === 'approved' ? 'primary' :
                  batch.status === 'failed' ? 'error' : 'default'
                }
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

