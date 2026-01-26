/**
 * لوحة التحليلات - الصفحة الرئيسية
 */

import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timeline,
  BarChart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

function DashboardCard({ title, description, icon, color, route }: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: 2,
            p: 2,
            display: 'inline-flex',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(route)}
          sx={{ bgcolor: color, '&:hover': { bgcolor: color, opacity: 0.9 } }}
        >
          عرض التفاصيل
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        لوحة التحليلات الشاملة
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        اختر نوع التحليل الذي تريد الاطلاع عليه
      </Typography>

      <Grid container spacing={3}>
        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <DashboardCard
            title="ROAS والإنفاق الإعلاني"
            description="تحليل العائد على الإنفاق الإعلاني ومتابعة الحملات التسويقية"
            icon={<TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />}
            color="#1976d2"
            route="/admin/analytics/roas"
          />
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <DashboardCard
            title="مؤشرات الأداء الرئيسية"
            description="متابعة KPIs والبيانات الحية لأداء النظام"
            icon={<Assessment sx={{ fontSize: 40, color: '#2e7d32' }} />}
            color="#2e7d32"
            route="/admin/analytics/kpis"
          />
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <DashboardCard
            title="التحليلات المتقدمة"
            description="LTV، Churn Rate، التوزيع الجغرافي، وأداء المنتجات والسائقين"
            icon={<BarChart sx={{ fontSize: 40, color: '#9c27b0' }} />}
            color="#9c27b0"
            route="/admin/analytics/advanced"
          />
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <DashboardCard
            title="قمع التحويل"
            description="تحليل مراحل التحويل ونقاط الانسحاب"
            icon={<Timeline sx={{ fontSize: 40, color: '#f57c00' }} />}
            color="#f57c00"
            route="/admin/analytics/funnel"
          />
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <DashboardCard
            title="تحليلات المستخدمين"
            description="نمو المستخدمين، الاحتفاظ، وتحليل الأفواج"
            icon={<TrendingUp sx={{ fontSize: 40, color: '#00bcd4' }} />}
            color="#00bcd4"
            route="/admin/analytics/users"
          />
        </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <DashboardCard
            title="توقعات الإيرادات"
            description="التنبؤ بالإيرادات وتحليل الاتجاهات المستقبلية"
            icon={<Assessment sx={{ fontSize: 40, color: '#e91e63' }} />}
            color="#e91e63"
            route="/admin/analytics/revenue"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

