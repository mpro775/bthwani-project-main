/**
 * لوحة النظام المالي
 */

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { AttachMoney, TrendingUp, Pending, CheckCircle } from '@mui/icons-material';
import {
  useFinancialReport,
  useCommissions,
  useFinanceStats,
  usePayCommission,
} from '@/api/finance';

function TabPanel({ children, value, index }: any) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FinanceDashboard() {
  const [tabValue, setTabValue] = useState(0);
  
  const { data: reportData, loading: loadingReport } = useFinancialReport();
  const { data: commissionsData, loading: loadingCommissions } = useCommissions({
    page: '1',
    limit: '10',
  });
  const { data: statsData } = useFinanceStats();
  
  const { mutate: payCommission, loading: paying } = usePayCommission({
    onSuccess: () => alert('تم الدفع بنجاح'),
  });

  if (loadingReport || loadingCommissions) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const report = reportData?.data;
  const stats = statsData;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        النظام المالي
      </Typography>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={3}>
        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AttachMoney sx={{ fontSize: 40, color: '#2e7d32' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalRevenue?.toLocaleString() || 0} ريال
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي العمولات
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalCommissions?.toLocaleString() || 0} ريال
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Pending sx={{ fontSize: 40, color: '#ed6c02' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    عمولات معلقة
                  </Typography>
                  <Typography variant="h5">
                    {stats?.pendingCommissions?.toLocaleString() || 0} ريال
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle sx={{ fontSize: 40, color: '#2e7d32' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    عمولات مدفوعة
                  </Typography>
                  <Typography variant="h5">
                    {stats?.paidCommissions?.toLocaleString() || 0} ريال
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* التقرير المالي */}
      {report && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              التقرير المالي
            </Typography>
            <Grid container spacing={2}>
              <Grid  size={{xs: 12, sm: 4}}>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الإيرادات
                </Typography>
                <Typography variant="h6" color="success.main">
                  {report.totalRevenue?.toLocaleString()} ريال
                </Typography>
              </Grid>
              <Grid  size={{xs: 12, sm: 4}}>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المصروفات
                </Typography>
                <Typography variant="h6" color="error.main">
                  {report.totalExpenses?.toLocaleString()} ريال
                </Typography>
              </Grid>
                <Grid  size={{xs: 12, sm: 4}}>
                <Typography variant="body2" color="text.secondary">
                  صافي الربح
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {report.netProfit?.toLocaleString()} ريال
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs للعمولات */}
      <Card>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="العمولات الحديثة" />
          <Tab label="معلقة" />
          <Tab label="مدفوعة" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {commissionsData?.data?.map((commission) => (
            <Card key={commission._id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{commission.userName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {commission.type === 'driver' ? 'سائق' : commission.type === 'marketer' ? 'مسوق' : 'متجر'}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6">{commission.amount} ريال</Typography>
                    <Chip
                      label={
                        commission.status === 'pending' ? 'معلق' :
                        commission.status === 'paid' ? 'مدفوع' : 'ملغي'
                      }
                      color={
                        commission.status === 'pending' ? 'warning' :
                        commission.status === 'paid' ? 'success' : 'default'
                      }
                      size="small"
                    />
                  </Box>
                  {commission.status === 'pending' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => payCommission(undefined, { params: { id: commission._id } })}
                      disabled={paying}
                    >
                      دفع
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Alert severity="info">العمولات المعلقة...</Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Alert severity="success">العمولات المدفوعة...</Alert>
        </TabPanel>
      </Card>
    </Box>
  );
}

