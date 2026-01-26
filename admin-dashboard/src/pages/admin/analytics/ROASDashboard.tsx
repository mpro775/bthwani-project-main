/**
 * ROAS Dashboard
 * لوحة تحكم ROAS (Return On Ad Spend)
 */

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { TrendingUp, TrendingDown, AttachMoney } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useDailyRoas, useRoasSummary, useRoasByPlatform } from '@/api/analytics-new';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
  subtitle?: string;
}

function StatCard({ title, value, icon, color, trend, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend === 'up' ? (
              <TrendingUp sx={{ color: '#4caf50', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: '#f44336', mr: 0.5 }} />
            )}
            <Typography
              variant="caption"
              sx={{ color: trend === 'up' ? '#4caf50' : '#f44336' }}
            >
              {trend === 'up' ? 'تحسن' : 'انخفاض'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function ROASDashboard() {
  const [platform, setPlatform] = useState<string>('all');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const dateRange = {
    startDate: startDate?.format('YYYY-MM-DD') || '',
    endDate: endDate?.format('YYYY-MM-DD') || '',
  };

  const { data: summaryData, loading: summaryLoading, error: summaryError } = useRoasSummary(dateRange);
  const { data: platformData, loading: platformLoading } = useRoasByPlatform(dateRange);
  const { data: dailyData, loading: dailyLoading } = useDailyRoas({
    ...dateRange,
    platform: platform !== 'all' ? platform : undefined,
  });

  const loading = summaryLoading || platformLoading || dailyLoading;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (summaryError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          خطأ في تحميل البيانات: {summaryError.message}
        </Alert>
      </Box>
    );
  }

  const summary = summaryData?.data;
  const platforms = platformData?.data || [];
  const dailyRoas = dailyData?.data || [];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          لوحة ROAS (العائد على الإنفاق الإعلاني)
        </Typography>
        <Box display="flex" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="من تاريخ"
              value={startDate}
              onChange={setStartDate}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 150 } },
              }}
            />
            <DatePicker
              label="إلى تاريخ"
              value={endDate}
              onChange={setEndDate}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 150 } },
              }}
            />
          </LocalizationProvider>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>المنصة</InputLabel>
            <Select
              value={platform}
              label="المنصة"
              onChange={(e) => setPlatform(e.target.value)}
            >
              <MenuItem value="all">جميع المنصات</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="google">Google</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="snapchat">Snapchat</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid  size={{xs: 12, md: 4}}>
          <StatCard
            title="إجمالي الإنفاق الإعلاني"
            value={`${summary?.totalAdSpend?.toLocaleString() || 0} ريال`}
            icon={<AttachMoney sx={{ fontSize: 32, color: '#f44336' }} />}
            color="#f44336"
          />
        </Grid>

        <Grid  size={{xs: 12, md: 4}}>
          <StatCard
            title="إجمالي الإيرادات"
            value={`${summary?.totalRevenue?.toLocaleString() || 0} ريال`}
            icon={<AttachMoney sx={{ fontSize: 32, color: '#4caf50' }} />}
            color="#4caf50"
          />
        </Grid>

        <Grid  size={{xs: 12, md: 4}}>
          <StatCard
            title="متوسط ROAS"
            value={summary?.averageRoas?.toFixed(2) || '0.00'}
            icon={<TrendingUp sx={{ fontSize: 32, color: '#2196f3' }} />}
            color="#2196f3"
            trend={summary && summary.averageRoas > 1 ? 'up' : 'down'}
            subtitle={`كل ريال إنفاق = ${summary?.averageRoas?.toFixed(2) || 0} ريال عائد`}
          />
        </Grid>

        {/* Best & Worst Days */}
        {summary?.bestDay && (
          <Grid  size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  أفضل يوم
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  التاريخ: {new Date(summary.bestDay.date).toLocaleDateString('ar-SA')}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.bestDay.roas.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {summary?.worstDay && (
          <Grid  size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  أسوأ يوم
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  التاريخ: {new Date(summary.worstDay.date).toLocaleDateString('ar-SA')}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.worstDay.roas.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Platform Performance */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الأداء حسب المنصة
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {platforms.map((platform) => (
                  <Grid  size={{xs: 12, sm: 6, md: 3}} key={platform.platform}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        {platform.platform}
                      </Typography>
                      <Typography variant="h5" sx={{ my: 1 }}>
                        {platform.roas.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إنفاق: {platform.adSpend.toLocaleString()} ريال
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        عائد: {platform.revenue.toLocaleString()} ريال
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {platform.campaigns} حملة
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily ROAS Table */}
        <Grid  size={{xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ROAS اليومي
              </Typography>
              <Box sx={{ overflowX: 'auto', mt: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'right' }}>التاريخ</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>المنصة</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الإنفاق</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>الإيرادات</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>ROAS</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>التحويلات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRoas.slice(0, 10).map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px' }}>
                          {new Date(item.date).toLocaleDateString('ar-SA')}
                        </td>
                        <td style={{ padding: '12px' }}>{item.platform}</td>
                        <td style={{ padding: '12px' }}>{item.adSpend.toLocaleString()} ريال</td>
                        <td style={{ padding: '12px' }}>{item.revenue.toLocaleString()} ريال</td>
                        <td style={{ padding: '12px' }}>
                          <Typography
                            component="span"
                            sx={{
                              color: item.roas > 1 ? '#4caf50' : '#f44336',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.roas.toFixed(2)}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px' }}>{item.conversions || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

