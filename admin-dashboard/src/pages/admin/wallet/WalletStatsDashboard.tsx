import  { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import {
  getWalletStats,
  getAllTransactions,
} from '../../../api/wallet';
import {
  AccountBalanceWallet as WalletIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function WalletStatsDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['walletStats', period],
    queryFn: () => getWalletStats(period),
  });

  // Fetch transactions for charts
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['walletTransactionsForStats', period],
    queryFn: () =>
      getAllTransactions({
        limit: 1000,
        startDate: getStartDate(period),
        endDate: new Date().toISOString(),
      }),
  });

  const getStartDate = (period: string): string => {
    const now = new Date();
    switch (period) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return new Date(0).toISOString();
    }
  };

  // Prepare chart data
  const prepareTransactionChartData = () => {
    if (!transactionsData?.data) return [];

    const transactions = transactionsData.data;
    const dailyData: Record<string, { credits: number; debits: number; date: string }> = {};

    transactions.forEach((t: any) => {
      const date = new Date(t.createdAt).toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
      });

      if (!dailyData[date]) {
        dailyData[date] = { credits: 0, debits: 0, date };
      }

      if (t.type === 'credit') {
        dailyData[date].credits += t.amount;
      } else {
        dailyData[date].debits += t.amount;
      }
    });

    return Object.values(dailyData).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const prepareMethodChartData = () => {
    if (!transactionsData?.data) return [];

    const transactions = transactionsData.data;
    const methodData: Record<string, number> = {};

    transactions.forEach((t: any) => {
      const method = t.method || 'other';
      methodData[method] = (methodData[method] || 0) + t.amount;
    });

    return Object.entries(methodData).map(([name, value]) => ({
      name: getMethodLabel(name),
      value,
    }));
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      kuraimi: 'كريمي',
      card: 'بطاقة',
      transfer: 'تحويل',
      payment: 'دفع',
      escrow: 'حجز',
      reward: 'مكافأة',
      agent: 'وكيل',
      withdrawal: 'سحب',
    };
    return methods[method] || method;
  };

  const chartData = prepareTransactionChartData();
  const methodData = prepareMethodChartData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (statsLoading || transactionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          لوحة إحصائيات المحفظة
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>الفترة</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            label="الفترة"
          >
            <MenuItem value="today">اليوم</MenuItem>
            <MenuItem value="week">هذا الأسبوع</MenuItem>
            <MenuItem value="month">هذا الشهر</MenuItem>
            <MenuItem value="year">هذا العام</MenuItem>
            <MenuItem value="all">الكل</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WalletIcon color="primary" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats?.totalBalance || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الأرصدة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="success" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.usersWithWallet || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    مستخدمين مع محافظ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="warning" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.transactionsInPeriod || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    معاملات في الفترة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="info" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats?.netInPeriod || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    صافي الفترة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                إجمالي الإيرادات والمصروفات
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(stats?.creditsInPeriod || 0)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المصروفات
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {formatCurrency(stats?.debitsInPeriod || 0)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  الرصيد المتاح
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {formatCurrency(stats?.totalAvailable || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                معلومات إضافية
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats?.totalUsers || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    المبالغ المحجوزة
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(stats?.totalOnHold || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    متوسط الرصيد
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(stats?.averageBalance || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    المعاملات اليوم
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stats?.transactionsToday || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid  size={{xs: 12, md: 8}}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                تطور المعاملات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="credits"
                    stroke="#00C49F"
                    name="إيرادات"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="debits"
                    stroke="#FF8042"
                    name="مصروفات"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{xs: 12, md: 4}}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                التوزيع حسب الطريقة
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {methodData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

          <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                المعاملات حسب الطريقة
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={methodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
