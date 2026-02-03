/**
 * Content Management Dashboard
 * لوحة إدارة المحتوى الرئيسية
 */

import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import {
  Article,
  Settings,
  Help,
  CardMembership,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ContentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  count?: number;
}

function ContentCard({ title, description, icon, color, route, count }: ContentCardProps) {
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
        {count !== undefined && (
          <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
            {count}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(route)}
          sx={{ bgcolor: color, '&:hover': { bgcolor: color, opacity: 0.9 } }}
        >
          إدارة
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ContentDashboard() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        إدارة المحتوى
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        إدارة جميع محتويات التطبيق والموقع
      </Typography>

      <Grid container spacing={3}>
        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <ContentCard
            title="صفحات CMS"
            description="إدارة الصفحات الثابتة: الشروط، الخصوصية، من نحن"
            icon={<Article sx={{ fontSize: 40, color: '#3f51b5' }} />}
            color="#3f51b5"
            route="/admin/content/cms-pages"
          />
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <ContentCard
            title="إعدادات التطبيق"
            description="الإعدادات العامة، رسوم التوصيل، الحد الأدنى للطلب"
            icon={<Settings sx={{ fontSize: 40, color: '#ff9800' }} />}
            color="#ff9800"
            route="/admin/content/app-settings"
          />
        </Grid>

        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <ContentCard
            title="الأسئلة الشائعة"
            description="إدارة الأسئلة الشائعة وإجاباتها"
            icon={<Help sx={{ fontSize: 40, color: '#009688' }} />}
            color="#009688"
            route="/admin/content/faqs"
          />
        </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <ContentCard
            title="خطط الاشتراك"
            description="إدارة خطط اشتراكات التجار"
            icon={<CardMembership sx={{ fontSize: 40, color: '#9c27b0' }} />}
            color="#9c27b0"
            route="/admin/content/subscriptions"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

