import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountBalance as SettlementIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getSettlementRequests,
  updateSettlementStatus,
  getSettlementStats,
  exportSettlements,
  type SettlementRequest
} from '../../api/settlements';

const SettlementDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  settlement: SettlementRequest | null;
  onStatusUpdate: (id: string, status: "completed" | "rejected", processedAt?: string) => void;
  loading: boolean;
}> = ({ open, onClose, settlement, onStatusUpdate, loading }) => {
  const [processedAt, setProcessedAt] = useState(dayjs().format('YYYY-MM-DD'));

  if (!settlement) return null;

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'معلقة';
      case 'rejected': return 'مرفوضة';
      default: return status;
    }
  };

  const handleStatusUpdate = (status: "completed" | "rejected") => {
    onStatusUpdate(settlement._id!, status, processedAt);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        تفاصيل طلب المستوطنة
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معلومات التاجر
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">الاسم:</Typography>
                      <Typography variant="body2">{settlement.vendor.fullName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">الهاتف:</Typography>
                      <Typography variant="body2">{settlement.vendor.phone}</Typography>
                    </Box>
                    {settlement.vendor.email && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">البريد الإلكتروني:</Typography>
                        <Typography variant="body2">{settlement.vendor.email}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معلومات المتجر
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">اسم المتجر:</Typography>
                      <Typography variant="body2">{settlement.store.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">العنوان:</Typography>
                      <Typography variant="body2">{settlement.store.address}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    تفاصيل طلب المستوطنة
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">المبلغ المطلوب:</Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(settlement.amount)} ر.ي
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">الحالة:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(settlement.status)}
                        <Chip
                          label={getStatusText(settlement.status)}
                          color={getStatusColor(settlement.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">تاريخ الطلب:</Typography>
                      <Typography variant="body2">{formatDate(settlement.requestedAt)}</Typography>
                    </Box>
                    {settlement.processedAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">تاريخ المعالجة:</Typography>
                        <Typography variant="body2">{formatDate(settlement.processedAt)}</Typography>
                      </Box>
                    )}
                    {settlement.bankAccount && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">الحساب البنكي:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {settlement.bankAccount}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {settlement.status === 'pending' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                تحديث حالة الطلب
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="تاريخ المعالجة"
                    value={dayjs(processedAt)}
                    onChange={(newValue) => setProcessedAt(newValue?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'))}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 150 },
                      },
                    }}
                  />
                </LocalizationProvider>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={loading}
                >
                  قبول الطلب
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={loading}
                >
                  رفض الطلب
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function SettlementsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter] = useState('');
  const [storeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch settlement requests
  const { data: settlementsData, isLoading, error } = useQuery({
    queryKey: ['settlementRequests', currentPage, pageSize, statusFilter, vendorFilter, storeFilter, dateFrom, dateTo],
    queryFn: () => getSettlementRequests({
      page: currentPage,
      limit: pageSize,
      status: statusFilter || undefined,
      vendorId: vendorFilter || undefined,
      storeId: storeFilter || undefined,
      fromDate: dateFrom?.format('YYYY-MM-DD'),
      toDate: dateTo?.format('YYYY-MM-DD'),
    }),
  });

  // Fetch settlement statistics
  const { data: stats } = useQuery({
    queryKey: ['settlementStats'],
    queryFn: () => getSettlementStats(),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, processedAt }: {
      id: string;
      status: "completed" | "rejected";
      processedAt?: string;
    }) => updateSettlementStatus(id, status, processedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlementRequests'] });
      queryClient.invalidateQueries({ queryKey: ['settlementStats'] });
      setDetailsDialogOpen(false);
      setSelectedSettlement(null);
    },
  });

  const handleViewDetails = (settlement: SettlementRequest) => {
    setSelectedSettlement(settlement);
    setDetailsDialogOpen(true);
  };

  const handleStatusUpdate = (id: string, status: "completed" | "rejected", processedAt?: string) => {
    updateStatusMutation.mutate({ id, status, processedAt });
  };

  const handleExport = async () => {
    try {
      const blob = await exportSettlements({
        status: statusFilter || undefined,
        fromDate: dateFrom?.format('YYYY-MM-DD'),
        toDate: dateTo?.format('YYYY-MM-DD'),
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlements_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const settlements = settlementsData?.settlementRequests || [];
  const pagination = settlementsData?.pagination;

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch =
      settlement.vendor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.vendor.phone.includes(searchTerm) ||
      settlement.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.bankAccount && settlement.bankAccount.includes(searchTerm));

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'معلقة';
      case 'rejected': return 'مرفوضة';
      default: return status;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل طلبات المستوطنات: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة المستوطنات
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            تصدير
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['settlementRequests'] })}
          >
            تحديث
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettlementIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الطلبات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.pendingRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      طلبات معلقة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.pendingAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      مبالغ معلقة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.completedAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      مبالغ مكتملة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="pending">معلقة</MenuItem>
                <MenuItem value="completed">مكتملة</MenuItem>
                <MenuItem value="rejected">مرفوضة</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="من تاريخ"
                value={dateFrom}
                onChange={setDateFrom}
                slotProps={{
                  textField: {
                    sx: { minWidth: 150 },
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="إلى تاريخ"
                value={dateTo}
                onChange={setDateTo}
                slotProps={{
                  textField: {
                    sx: { minWidth: 150 },
                  },
                }}
              />
            </LocalizationProvider>

            <Chip
              label={`${filteredSettlements.length} طلب`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>التاجر</TableCell>
                  <TableCell>المتجر</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ الطلب</TableCell>
                  <TableCell>تاريخ المعالجة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSettlements.map((settlement) => (
                  <TableRow key={settlement._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {settlement.vendor.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {settlement.vendor.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {settlement.store.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {settlement.store.address}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {formatCurrency(settlement.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(settlement.status)}
                        <Chip
                          label={getStatusText(settlement.status)}
                          color={getStatusColor(settlement.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(settlement.requestedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {settlement.processedAt ? formatDate(settlement.processedAt) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                        <Tooltip title="عرض التفاصيل">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(settlement)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            السابق
          </Button>

          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            صفحة {pagination.page} من {pagination.pages}
          </Typography>

          <Button
            variant="outlined"
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            التالي
          </Button>
        </Box>
      )}

      {filteredSettlements.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <SettlementIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد طلبات مستوطنات</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter || dateFrom || dateTo
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'لا توجد طلبات مستوطنات لعرضها'
            }
          </Typography>
        </Box>
      )}

      {/* Settlement Details Dialog */}
      <SettlementDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedSettlement(null);
        }}
        settlement={selectedSettlement}
        onStatusUpdate={handleStatusUpdate}
        loading={updateStatusMutation.isPending}
      />
    </Box>
  );
}
