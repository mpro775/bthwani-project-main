/**
 * ER/HR Dashboard
 * لوحة تحكم الموارد البشرية والمحاسبة
 */

import { Box, Grid, Card, CardContent, Typography, Button, Tabs, Tab } from '@mui/material';
import { People, EventAvailable, AccountBalance, Receipt } from '@mui/icons-material';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>;
}

export default function ERDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        نظام الموارد البشرية والمحاسبة
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="نظرة عامة" />
          <Tab label="الموظفين" />
          <Tab label="الحضور والإجازات" />
          <Tab label="الرواتب" />
          <Tab label="المحاسبة" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <People sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                <Typography variant="h4">-</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الموظفين
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <EventAvailable sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
                <Typography variant="h4">-</Typography>
                <Typography variant="body2" color="text.secondary">
                  الحضور اليوم
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Receipt sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                <Typography variant="h4">-</Typography>
                <Typography variant="body2" color="text.secondary">
                  الرواتب المعلقة
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <AccountBalance sx={{ fontSize: 40, color: '#7b1fa2', mb: 1 }} />
                <Typography variant="h4">-</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الحسابات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            الإجراءات السريعة
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid  size={{xs: 12}}>
              <Button variant="outlined" onClick={() => setTab(1)}>
                إدارة الموظفين
              </Button>
            </Grid>
            <Grid  size={{xs: 12}}>
              <Button variant="outlined" onClick={() => setTab(2)}>
                الحضور والإجازات
              </Button>
            </Grid>
            <Grid  size={{xs: 12}}>
              <Button variant="outlined" onClick={() => setTab(3)}>
                كشوفات الرواتب
              </Button>
            </Grid>
            <Grid  size={{xs: 12}}>
              <Button variant="outlined" onClick={() => setTab(4)}>
                دليل الحسابات
              </Button>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      {/* Employees Tab */}
      <TabPanel value={tab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              إدارة الموظفين
            </Typography>
            <Typography color="text.secondary">
              قريباً... سيتم إضافة صفحة إدارة الموظفين الكاملة
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              متاح حالياً في: <code>/admin/hr/employees</code>
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Attendance Tab */}
      <TabPanel value={tab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              الحضور والإجازات
            </Typography>
            <Typography color="text.secondary">
              قريباً... سيتم إضافة صفحة الحضور والإجازات
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              متاح حالياً في: <code>/admin/hr/attendance</code>
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Payroll Tab */}
      <TabPanel value={tab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              كشوفات الرواتب
            </Typography>
            <Typography color="text.secondary">
              قريباً... سيتم إضافة صفحة كشوفات الرواتب
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              متاح حالياً في: <code>/admin/hr/payroll</code>
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Accounting Tab */}
      <TabPanel value={tab} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              المحاسبة
            </Typography>
            <Typography color="text.secondary">
              قريباً... سيتم إضافة نظام المحاسبة الكامل
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              متاح حالياً في: <code>/admin/finance</code>
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

