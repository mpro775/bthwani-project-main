import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

export default function AdminReportsPage() {
  const theme = useTheme();

  const reportCards = [
    {
      title: 'تقارير الطلبات',
      description: 'تحليلات مفصلة للطلبات والمبيعات',
      icon: <AssessmentIcon />,
      path: '/admin/reports/orders',
    },
    {
      title: 'تقارير الكباتن',
      description: 'أداء وإحصائيات السائقين',
      icon: <PeopleIcon />,
      path: '/admin/reports/drivers',
    },
    {
      title: 'تقارير المطاعم',
      description: 'تحليل أداء المطاعم والمتاجر',
      icon: <StoreIcon />,
      path: '/admin/reports/restaurants',
    },
    {
      title: 'تقارير العروض',
      description: 'تحليل فعالية العروض والكوبونات',
      icon: <TrendingUpIcon />,
      path: '/admin/reports/offers',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        التقارير والتحليلات
      </Typography>

      <Grid container spacing={3}>
        {reportCards.map((card, index) => (
          <Grid size={{xs: 12, sm: 6, md: 3}} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2, color: theme.palette.primary.main }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  fullWidth
                  onClick={() => window.location.href = card.path}
                >
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
