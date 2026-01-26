/**
 * Coupons Manager
 * إدارة الكوبونات
 */

import { Box, Card, CardContent, Typography, Chip, CircularProgress, Alert, Grid } from '@mui/material';
import { useCoupons } from '@/api/finance-new';

export default function CouponsPage() {
  const { data, loading, error } = useCoupons();

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

  const coupons = data?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        إدارة الكوبونات
      </Typography>

      <Grid container spacing={2}>
        {coupons.map((coupon) => (
          <Grid  size={{xs: 12, sm: 6, md: 4}} key={coupon.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6">{coupon.code}</Typography>
                  <Chip
                    label={coupon.isActive ? 'نشط' : 'غير نشط'}
                    color={coupon.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ريال`}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  استخدام: {coupon.usedCount} / {coupon.usageLimit || '∞'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

