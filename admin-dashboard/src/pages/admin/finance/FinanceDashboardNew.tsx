/**
 * Finance Dashboard - النسخة الجديدة الكاملة
 */

import { Box, Grid, Card, CardContent, Typography, Button, Tabs, Tab } from '@mui/material';
import {
  AccountBalance,
  Receipt,
  LocalOffer,
  CompareArrows,
  Assessment,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>;
}

interface FinanceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

function FinanceCard({ title, description, icon, color, route }: FinanceCardProps) {
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
          إدارة
        </Button>
      </CardContent>
    </Card>
  );
}

export default function FinanceDashboardNew() {
  const [tab, setTab] = useState(0);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        النظام المالي الشامل
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="نظرة عامة" />
          <Tab label="إدارة سريعة" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <FinanceCard
              title="دفعات العمولات"
              description="إنشاء وإدارة دفعات دفع العمولات للسائقين والمتاجر والمسوقين"
              icon={<AccountBalance sx={{ fontSize: 40, color: '#1976d2' }} />}
              color="#1976d2"
              route="/admin/finance/payouts"
            />
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <FinanceCard
              title="التسويات المالية"
              description="إدارة تسويات السائقين والمتاجر والموافقة عليها"
              icon={<Receipt sx={{ fontSize: 40, color: '#2e7d32' }} />}
              color="#2e7d32"
              route="/admin/finance/settlements"
            />
          </Grid>

            <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <FinanceCard
              title="الكوبونات"
              description="إنشاء وإدارة كوبونات الخصم والعروض"
              icon={<LocalOffer sx={{ fontSize: 40, color: '#ed6c02' }} />}
              color="#ed6c02"
              route="/admin/finance/coupons"
            />
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <FinanceCard
              title="المطابقات المالية"
              description="مطابقة الحسابات والتحقق من التطابق المالي"
              icon={<CompareArrows sx={{ fontSize: 40, color: '#9c27b0' }} />}
              color="#9c27b0"
              route="/admin/finance/reconciliations"
            />
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 4}}>
            <FinanceCard
              title="التقارير المالية"
              description="التقارير اليومية والشهرية وميزان المراجعة"
              icon={<Assessment sx={{ fontSize: 40, color: '#d32f2f' }} />}
              color="#d32f2f"
              route="/admin/finance/reports"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Quick Actions Tab */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid  size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  إجراءات سريعة - العمولات
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button variant="outlined" fullWidth>
                    عرض العمولات المعلقة
                  </Button>
                  <Button variant="outlined" fullWidth>
                    إنشاء دفعة دفع جديدة
                  </Button>
                  <Button variant="outlined" fullWidth>
                    عرض الدفعات المعلقة
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  إجراءات سريعة - التقارير
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button variant="outlined" fullWidth>
                    إنشاء تقرير يومي
                  </Button>
                  <Button variant="outlined" fullWidth>
                    إنشاء مطابقة مالية
                  </Button>
                  <Button variant="outlined" fullWidth>
                    عرض التقارير الأخيرة
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}

