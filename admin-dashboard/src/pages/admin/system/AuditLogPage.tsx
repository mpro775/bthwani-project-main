import React, { useState, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Person,
  AdminPanelSettings,
  Business,
  AccountCircle,
  CheckCircle,
  Error,
  Computer,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../utils/axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AuditLog {
  _id: string;
  actorId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  actorType: 'admin' | 'vendor' | 'user' | 'system';
  action: string;
  method: string;
  route: string;
  status: 'success' | 'error';
  ip?: string;
  userAgent?: string;
  details?: string;
  durationMs?: number;
  createdAt: string;
}



const AuditLogPage: React.FC = () => {
  const [filters, setFilters] = useState({
    q: '',
    actorId: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    actorType: '',
    status: '',
    method: '',
    page: 0,
    limit: 50,
  });

  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // جلب سجل التدقيق
  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`/admin/audit-logs?${params}`);
      return response.data;
    },
  });

  // جلب الإحصائيات
  const { data: statsData } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const response = await axios.get('/admin/audit-logs/stats');
      return response.data;
    },
  });

  // جلب آخر إجراءاتي
  const { data: myActionsData } = useQuery({
    queryKey: ['my-actions'],
    queryFn: async () => {
      const response = await axios.get('/admin/audit-logs/my-actions?limit=3');
      return response.data;
    },
  });

    const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = ( newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement> | ChangeEvent<Omit<HTMLInputElement, "value"> & { value: number; }> | (Event & { target: { value: number; name: string; }; }) | SelectChangeEvent<number>) => {
    setFilters(prev => ({ ...prev, limit: parseInt(event.target.value.toString(), 10), page: 0 }));
  };

  const handleShowDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetails(log._id);
  };

  const getActorTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <AdminPanelSettings fontSize="small" />;
      case 'vendor':
        return <Business fontSize="small" />;
      case 'user':
        return <Person fontSize="small" />;
      case 'system':
        return <Computer fontSize="small" />;
      default:
        return <AccountCircle fontSize="small" />;
    }
  };

  const getActorTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'primary';
      case 'vendor':
        return 'secondary';
      case 'user':
        return 'info';
      case 'system':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <CheckCircle color="success" fontSize="small" />
    ) : (
      <Error color="error" fontSize="small" />
    );
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ar });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* رأس الصفحة */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/admin">لوحة التحكم</Link>
          <Typography color="text.primary">سجل التدقيق</Typography>
        </Breadcrumbs>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1">
            سجل التدقيق
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              تحديث
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* إحصائيات سريعة */}
      {statsData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  إجمالي السجلات
                </Typography>
                <Typography variant="h4">
                  {statsData.total.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

            <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  آخر 24 ساعة
                </Typography>
                <Typography variant="h4" color="primary">
                  {statsData.last24h.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  آخر 7 أيام
                </Typography>
                <Typography variant="h4" color="secondary">
                  {statsData.last7d.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  آخر 30 يوم
                </Typography>
                <Typography variant="h4" color="info">
                  {statsData.last30d.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* آخر إجراءاتي */}
      {myActionsData?.logs && myActionsData.logs.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              آخر إجراءاتي
            </Typography>

            <Stack spacing={2}>
              {myActionsData.logs.map((log: AuditLog) => (
                <Stack
                  key={log._id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {getStatusIcon(log.status)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {log.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(log.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={log.status === 'success' ? 'نجح' : 'فشل'}
                    color={log.status === 'success' ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* فلاتر البحث */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs: 12, sm: 6, md: 3}}>
              <TextField
                fullWidth
                label="بحث"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                placeholder="ابحث في الإجراء أو التفاصيل"
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>نوع المنفذ</InputLabel>
                <Select
                  value={filters.actorType}
                  onChange={(e) => handleFilterChange('actorType', e.target.value)}
                  label="نوع المنفذ"
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="admin">مدير</MenuItem>
                  <MenuItem value="vendor">تاجر</MenuItem>
                  <MenuItem value="user">مستخدم</MenuItem>
                  <MenuItem value="system">نظام</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs: 12, sm: 6, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="الحالة"
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="success">نجح</MenuItem>
                  <MenuItem value="error">فشل</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs: 12, sm: 6, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>الطريقة</InputLabel>
                <Select
                  value={filters.method}
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                  label="الطريقة"
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
            </Grid>

              <Grid size={{xs: 12, sm: 6, md: 2}}>
              <TextField
                fullWidth
                type="date"
                label="من تاريخ"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6, md: 2}}>
              <TextField
                fullWidth
                type="date"
                label="إلى تاريخ"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6, md: 1}}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilters({
                  q: '',
                  actorId: '',
                  action: '',
                  dateFrom: '',
                  dateTo: '',
                  actorType: '',
                  status: '',
                  method: '',
                  page: 0,
                  limit: 50,
                })}
              >
                مسح الفلاتر
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* جدول السجلات */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>التاريخ</TableCell>
                      <TableCell>المنفذ</TableCell>
                      <TableCell>الإجراء</TableCell>
                      <TableCell>الطريقة</TableCell>
                      <TableCell>الحالة</TableCell>
                      <TableCell>المدة</TableCell>
                      <TableCell>الإجراءات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditData?.logs?.map((log: AuditLog) => (
                      <TableRow key={log._id} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">
                              {formatDate(log.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.ip && `IP: ${log.ip}`}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getActorTypeIcon(log.actorType)}
                            <Box>
                              <Chip
                                label={
                                  log.actorId?.name ||
                                  log.actorId?.email ||
                                  log.actorType
                                }
                                size="small"
                                color={getActorTypeColor(log.actorType) as 'primary' | 'secondary' | 'info' | 'warning' | 'default'}
                              />
                              <Typography variant="caption" display="block">
                                {log.actorType}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {log.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.route}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={log.method}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getStatusIcon(log.status)}
                            <Typography variant="body2">
                              {log.status === 'success' ? 'نجح' : 'فشل'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatDuration(log.durationMs)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleShowDetails(log)}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {auditData?.pagination && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>عدد النتائج</InputLabel>
                    <Select
                      value={filters.limit}
                      onChange={handleLimitChange}
                      label="عدد النتائج"
                    >
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>

                  <TablePagination
                    component="div"
                    count={auditData.pagination.total}
                    page={auditData.pagination.page - 1}
                    onPageChange={(_, newPage) => handlePageChange(newPage)}
                    rowsPerPage={auditData.pagination.limit}
                    rowsPerPageOptions={[]}
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} من ${count}`
                    }
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* نافذة تفاصيل السجل */}
      <Dialog
        open={!!showDetails}
        onClose={() => setShowDetails(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                {getActorTypeIcon(selectedLog.actorType)}
                <Typography variant="h6">
                  تفاصيل السجل: {selectedLog.action}
                </Typography>
                <Chip
                  label={selectedLog.status === 'success' ? 'نجح' : 'فشل'}
                  color={selectedLog.status === 'success' ? 'success' : 'error'}
                />
              </Stack>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" gutterBottom>
                    معلومات عامة
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>التاريخ:</strong> {formatDate(selectedLog.createdAt)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>المنفذ:</strong> {selectedLog.actorType}
                    </Typography>
                    {selectedLog.actorId && (
                      <Typography variant="body2">
                        <strong>الاسم:</strong> {selectedLog.actorId.name || selectedLog.actorId.email}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>الطريقة:</strong> {selectedLog.method}
                    </Typography>
                    <Typography variant="body2">
                      <strong>المسار:</strong> {selectedLog.route}
                    </Typography>
                    <Typography variant="body2">
                      <strong>عنوان IP:</strong> {selectedLog.ip || 'غير متوفر'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>مدة التنفيذ:</strong> {formatDuration(selectedLog.durationMs)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" gutterBottom>
                    تفاصيل الطلب
                  </Typography>
                  {selectedLog.details && (
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: 200
                      }}
                    >
                      {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setShowDetails(null)}>إغلاق</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AuditLogPage;
