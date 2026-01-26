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
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Visibility,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getPayoutBatches,
  getPayoutBatchDetails,
  generatePayoutBatch,
  processPayoutBatch,
  exportPayoutBatchToCSV,
  type PayoutBatch,
  type PayoutItem,
  type GeneratePayoutBatchParams
} from '../../api/finance';

const PayoutBatchDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  batch: PayoutBatch | null;
  onProcess: (id: string) => void;
  loading: boolean;
}> = ({ open, onClose, batch, onProcess, loading }) => {
  const [items, setItems] = useState<PayoutItem[]>([]);

  React.useEffect(() => {
    if (batch) {
      // Fetch batch items
      getPayoutBatchDetails(batch.id).then((result: { items: PayoutItem[] }) => {
        setItems(result.items || []);
      });
    }
  }, [batch]);

  if (!batch) return null;

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
      case 'paid': return 'success';
      case 'processing': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckIcon />;
      case 'processing': return <PendingIcon />;
      case 'draft': return <PendingIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'processing': return 'قيد المعالجة';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await exportPayoutBatchToCSV(batch.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payout-batch-${batch.id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        تفاصيل دفعة السائقين
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Batch Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid  size={{xs: 12, md: 6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معلومات الدفعة
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">رقم الدفعة:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {batch.id}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">الحالة:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(batch.status)}
                        <Chip
                          label={getStatusText(batch.status)}
                          color={getStatusColor(batch.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">العملة:</Typography>
                      <Typography variant="body2">{batch.currency}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, md: 6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    الفترة والمبالغ
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">من تاريخ:</Typography>
                      <Typography variant="body2">{formatDate(batch.period_start)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">إلى تاريخ:</Typography>
                      <Typography variant="body2">{formatDate(batch.period_end)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">عدد السائقين:</Typography>
                      <Typography variant="body2">{batch.total_count}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">إجمالي المبلغ:</Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(batch.total_amount)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Payout Items */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                عناصر الدفعة ({items.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>السائق</TableCell>
                      <TableCell>المستفيد</TableCell>
                      <TableCell>المبلغ</TableCell>
                      <TableCell>الرسوم</TableCell>
                      <TableCell>صافي المبلغ</TableCell>
                      <TableCell>الحالة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {(item.account_id as unknown as { owner_id: string })?.owner_id || 'غير محدد'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {item.beneficiary}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatCurrency(item.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatCurrency(item.fees)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {formatCurrency(item.net_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status === 'processed' ? 'معالج' : item.status === 'failed' ? 'فشل' : 'معلق'}
                            size="small"
                            color={item.status === 'processed' ? 'success' : item.status === 'failed' ? 'error' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Actions */}
          {batch.status === 'draft' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                إجراءات
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => onProcess(batch.id)}
                  disabled={loading}
                >
                  معالجة الدفعة
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                >
                  تصدير CSV
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

const GeneratePayoutDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onGenerate: (data: {
    period_start: string;
    period_end: string;
    min_amount?: number;
  }) => void;
  loading: boolean;
}> = ({ open, onClose, onGenerate, loading }) => {
  const [periodStart, setPeriodStart] = useState(dayjs().startOf('month'));
  const [periodEnd, setPeriodEnd] = useState(dayjs().endOf('month'));
  const [minAmount, setMinAmount] = useState(0);

  const handleGenerate = () => {
    onGenerate({
      period_start: periodStart.format('YYYY-MM-DD'),
      period_end: periodEnd.format('YYYY-MM-DD'),
      min_amount: minAmount > 0 ? minAmount : undefined
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        إنشاء دفعة سائقين جديدة
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ البداية"
              value={periodStart}
              onChange={(newValue) => newValue && setPeriodStart(newValue)}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ النهاية"
              value={periodEnd}
              onChange={(newValue) => newValue && setPeriodEnd(newValue)}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="الحد الأدنى للمبلغ (اختياري)"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(parseFloat(e.target.value) || 0)}
            fullWidth
            helperText="سيتم تضمين السائقين الذين لديهم رصيد متاح أكبر من هذا المبلغ فقط"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <ScheduleIcon />}
        >
          إنشاء الدفعة
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PayoutsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<PayoutBatch | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch payout batches
  const { data: batchesData, isLoading, error } = useQuery({
    queryKey: ['payout-batches', currentPage, pageSize, statusFilter, dateFrom, dateTo],
    queryFn: () => getPayoutBatches({
      page: currentPage,
      perPage: pageSize,
      status: statusFilter || undefined,
      date_from: dateFrom?.toDate(),
      date_to: dateTo?.toDate(),
    }),
  });

  // Mutations
  const generatePayoutMutation = useMutation({
    mutationFn: (params: GeneratePayoutBatchParams) => generatePayoutBatch(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-batches'] });
      setGenerateDialogOpen(false);
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: (batchId: string) => processPayoutBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-batches'] });
      setDetailsDialogOpen(false);
      setSelectedBatch(null);
    },
  });

  const handleViewDetails = (batch: PayoutBatch) => {
    setSelectedBatch(batch);
    setDetailsDialogOpen(true);
  };

  const handleProcess = (batchId: string) => {
    processPayoutMutation.mutate(batchId);
  };

  const handleGeneratePayout = (data: {
    period_start: string;
    period_end: string;
    min_amount?: number;
  }) => {
    generatePayoutMutation.mutate(data);
  };

  const batches = batchesData?.batches || [];
  const pagination = batchesData?.pagination;

  const filteredBatches = batches.filter((batch: PayoutBatch) => {
    const matchesSearch =
      batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.notes && batch.notes.toLowerCase().includes(searchTerm.toLowerCase()));

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
      case 'paid': return 'success';
      case 'processing': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckIcon />;
      case 'processing': return <PendingIcon />;
      case 'draft': return <PendingIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'processing': return 'قيد المعالجة';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل دفعات السائقين: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          إدارة دفعات السائقين
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<ScheduleIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            إنشاء دفعة جديدة
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['payout-batches'] })}
          >
            تحديث
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="البحث في الدفعات..."
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
                <MenuItem value="draft">مسودة</MenuItem>
                <MenuItem value="processing">قيد المعالجة</MenuItem>
                <MenuItem value="paid">مدفوعة</MenuItem>
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
              label={`${filteredBatches.length} دفعة`}
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
                  <TableCell>رقم الدفعة</TableCell>
                  <TableCell>الفترة</TableCell>
                  <TableCell>عدد السائقين</TableCell>
                  <TableCell>إجمالي المبلغ</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>تاريخ الإنشاء</TableCell>
                  <TableCell>تاريخ المعالجة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBatches.map((batch: PayoutBatch) => (
                  <TableRow key={batch._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                        {batch.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(batch.period_start).format('DD/MM')} - {dayjs(batch.period_end).format('DD/MM/YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {batch.total_count}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {formatCurrency(batch.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(batch.status)}
                        <Chip
                          label={getStatusText(batch.status)}
                          color={getStatusColor(batch.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(batch.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {batch.processed_at ? formatDate(batch.processed_at) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(batch)}
                        >
                          <Visibility fontSize="small" />
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

      {filteredBatches.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PaymentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد دفعات</Typography>
          <Typography variant="body2">
            {searchTerm || statusFilter || dateFrom || dateTo
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'لا توجد دفعات لعرضها'
            }
          </Typography>
        </Box>
      )}

      {/* Payout Batch Details Dialog */}
      <PayoutBatchDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedBatch(null);
        }}
        batch={selectedBatch}
        onProcess={handleProcess}
        loading={processPayoutMutation.isPending}
      />

      {/* Generate Payout Dialog */}
      <GeneratePayoutDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onGenerate={handleGeneratePayout}
        loading={generatePayoutMutation.isPending}
      />
    </Box>
  );
}
