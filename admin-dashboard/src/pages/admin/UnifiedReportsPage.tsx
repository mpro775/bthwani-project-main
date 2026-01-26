import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingIcon,
  CompareArrows as CompareIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  exportSalesReport,
  exportPayoutsReport,
  exportOrdersReport,
  exportFeesTaxesReport,
  exportRefundsReport,
  getDataSummary,
  validateDataConsistency,
} from '../../api/finance';

import useExportWithProgress, { type ExportProgress } from '../../hooks/useExportWithProgress';

type ReportType = 'sales' | 'payouts' | 'orders' | 'fees-taxes' | 'refunds';

type ValidatedReportType = 'sales' | 'payouts' | 'orders';
type ReportSummaryType = {
  totalAmount: number;
  totalRecords: number;
};

interface ValidationResult {
  totalMatch: boolean;
  countMatch: boolean;
  fileTotal: number;
  uiTotal: number;
  fileCount: number;
  uiCount: number;
  totalDifference: number;
  countDifference: number;
}

const ReportCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onExport: () => void;
  loading?: boolean;
  disabled?: boolean;
  exportProgress?: ExportProgress;
}> = ({ title, description, icon, onExport, loading, disabled, exportProgress }) => (
  <Card sx={{ height: '100%', opacity: disabled ? 0.6 : 1 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Box sx={{ ml: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>

      {exportProgress && exportProgress.stage !== 'preparing' && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {exportProgress.message}
            </Typography>
            <Typography variant="body2" color="primary">
              {exportProgress.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={exportProgress.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: exportProgress.stage === 'error' ? 'error.main' : 'primary.main',
                borderRadius: 3
              }
            }}
          />
        </Box>
      )}

      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
        onClick={onExport}
        disabled={loading || disabled}
        fullWidth
      >
        تصدير التقرير
      </Button>
    </CardContent>
  </Card>
);

const ValidationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  reportType: ReportType;
  result: ValidationResult | null;
  loading: boolean;
}> = ({ open, onClose, reportType, result, loading }) => {
  if (!result) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        فحص مطابقة البيانات - {reportType === 'sales' ? 'تقرير المبيعات' :
                                reportType === 'payouts' ? 'تقرير المدفوعات' :
                                reportType === 'orders' ? 'تقرير الطلبات' :
                                reportType === 'fees-taxes' ? 'تقرير الرسوم والضرائب' :
                                'تقرير المرتجعات'}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            {/* ملخص المطابقة */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid  size={{xs: 12, md: 6}}>
                <Card sx={{ bgcolor: result.totalMatch ? 'success.light' : 'error.light' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {result.totalMatch ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                      <Typography variant="h6">
                        مطابقة الإجماليات
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      الشاشة: {formatCurrency(result.uiTotal)} ر.ي
                    </Typography>
                    <Typography variant="body2">
                      الملف: {formatCurrency(result.fileTotal)} ر.ي
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      الفرق: {formatCurrency(Math.abs(result.totalDifference))} ر.ي
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid  size={{xs: 12, md: 6}}>
                <Card sx={{ bgcolor: result.countMatch ? 'success.light' : 'warning.light' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {result.countMatch ? <CheckIcon color="success" /> : <WarningIcon color="warning" />}
                      <Typography variant="h6">
                        مطابقة العدد
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      الشاشة: {result.uiCount} سجل
                    </Typography>
                    <Typography variant="body2">
                      الملف: {result.fileCount} سجل
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      الفرق: {Math.abs(result.countDifference)} سجل
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* تفاصيل إضافية */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">تفاصيل إضافية</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="حالة المطابقة الكاملة"
                      secondary={result.totalMatch && result.countMatch ? 'مطابق تمامًا' : 'يوجد اختلاف'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="نسبة دقة الإجماليات"
                      secondary={`${((1 - Math.abs(result.totalDifference) / Math.max(result.uiTotal, result.fileTotal)) * 100).toFixed(2)}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="نسبة دقة العدد"
                      secondary={`${((1 - Math.abs(result.countDifference) / Math.max(result.uiCount, result.fileCount)) * 100).toFixed(2)}%`}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function UnifiedReportsPage() {
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());
  const [selectedReport, setSelectedReport] = useState<ReportType>('orders');
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');

  // حالات التحقق من المطابقة
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    reportType: ReportType;
  }>({ open: false, reportType: 'orders' });

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uiTotals, setUITotals] = useState<Record<ReportType, { total: number; count: number }>>({
    sales: { total: 0, count: 0 },
    payouts: { total: 0, count: 0 },
    orders: { total: 0, count: 0 },
    'fees-taxes': { total: 0, count: 0 },
    refunds: { total: 0, count: 0 }
  });

  const queryClient = useQueryClient();

  // استخدام hook التصدير مع التقدم
  const { exportWithProgress, exportProgress, isExporting } = useExportWithProgress({
    onComplete: (filename) => {
      toast.success(`تم تصدير ${filename} بنجاح!`);
    },
    onError: (error) => {
      toast.error('فشل في التصدير: ' + error.message);
    }
  });

  // جلب ملخص البيانات لكل نوع تقرير
  const { data: dataSummaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['reports-data-summaries', dateFrom?.format('YYYY-MM-DD'), dateTo?.format('YYYY-MM-DD')],
    queryFn: async () => {
      if (!dateFrom || !dateTo) return {};

      const startDate = dateFrom.format('YYYY-MM-DD');
      const endDate = dateTo.format('YYYY-MM-DD');

      const summaries: Record<string, ReportSummaryType> = {};

      for (const reportType of ['sales', 'payouts', 'orders'] as ValidatedReportType[]) {
        try {
          const summary = await getDataSummary({
            startDate,
            endDate,
            reportType,
            storeId: storeFilter || undefined,
            status: statusFilter || undefined
          });
          summaries[reportType] = summary.summary;
        } catch (error) {
          console.error(`فشل في جلب ملخص ${reportType}:`, error);
        }
      }

      return summaries;
    },
    enabled: !!(dateFrom && dateTo)
  });

  // تحديث قيم الشاشة بناءً على ملخص البيانات
  React.useEffect(() => {
    if (dataSummaries) {
      setUITotals(prev => ({
        ...prev,
        sales: {
          total: dataSummaries.sales?.totalAmount || 0,
          count: dataSummaries.sales?.totalRecords || 0
        },
        payouts: {
          total: dataSummaries.payouts?.totalAmount || 0,
          count: dataSummaries.payouts?.totalRecords || 0
        },
        orders: {
          total: dataSummaries.orders?.totalAmount || 0,
          count: dataSummaries.orders?.totalRecords || 0
        }
      }));
    }
  }, [dataSummaries]);

  // دالة التصدير المحدثة باستخدام hook التقدم
  const handleExport = async (reportType: ReportType) => {
    const params = {
      startDate: dateFrom?.format('YYYY-MM-DD') || '',
      endDate: dateTo?.format('YYYY-MM-DD') || '',
      storeId: storeFilter || undefined,
      status: statusFilter || undefined,
      format
    };

    const filename = `${reportType}-report-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.${format}`;

    let exportFunction: () => Promise<Blob>;
    switch (reportType) {
      case 'sales':
        exportFunction = () => exportSalesReport(params);
        break;
      case 'payouts':
        exportFunction = () => exportPayoutsReport(params);
        break;
      case 'orders':
        exportFunction = () => exportOrdersReport(params);
        break;
      case 'fees-taxes':
        exportFunction = () => exportFeesTaxesReport(params);
        break;
      case 'refunds':
        exportFunction = () => exportRefundsReport(params);
        break;
      default:
        throw new Error('نوع التقرير غير مدعوم');
    }

    await exportWithProgress(exportFunction, filename, reportType);
  };

  // Mutation لفحص المطابقة
  const validateMutation = useMutation({
    mutationFn: async (reportType: ValidatedReportType) => {
      const params = {
        reportType,
        startDate: dateFrom?.format('YYYY-MM-DD') || '',
        endDate: dateTo?.format('YYYY-MM-DD') || '',
        uiTotal: uiTotals[reportType].total,
        uiCount: uiTotals[reportType].count,
        storeId: storeFilter || undefined,
        status: statusFilter || undefined
      };

      return await validateDataConsistency(params);
    },
    onSuccess: (result) => {
      setValidationResult(result.consistency);
    }
  });


  const handleValidate = (reportType: ValidatedReportType) => {
    setValidationDialog({ open: true, reportType });
    validateMutation.mutate(reportType);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getReportIcon = (reportType: ReportType) => {
    switch (reportType) {
      case 'sales': return <TrendingIcon />;
      case 'payouts': return <ReportIcon />;
      case 'orders': return <ReportIcon />;
      case 'fees-taxes': return <FileDownloadIcon />;
      case 'refunds': return <CompareIcon />;
      default: return <ReportIcon />;
    }
  };

  const getReportTitle = (reportType: ReportType) => {
    switch (reportType) {
      case 'sales': return 'تقرير المبيعات';
      case 'payouts': return 'تقرير المدفوعات';
      case 'orders': return 'تقرير الطلبات';
      case 'fees-taxes': return 'تقرير الرسوم والضرائب';
      case 'refunds': return 'تقرير المرتجعات';
      default: return 'تقرير';
    }
  };

  const getReportDescription = (reportType: ReportType) => {
    switch (reportType) {
      case 'sales': return 'تقرير شامل للمبيعات والإيرادات';
      case 'payouts': return 'تقرير المدفوعات للسائقين والتجار';
      case 'orders': return 'تقرير تفصيلي لجميع الطلبات';
      case 'fees-taxes': return 'تقرير الرسوم والضرائب المطبقة';
      case 'refunds': return 'تقرير المرتجعات والاستردادات';
      default: return 'تقرير عام';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          التقارير المالية الموحدة
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['reports-data-summaries'] })}
          >
            تحديث البيانات
          </Button>
        </Box>
      </Box>

      {/* فلاتر التقارير */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid  size={{xs: 12, md: 3}}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="من تاريخ"
                  value={dateFrom}
                  onChange={setDateFrom}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid  size={{xs: 12, md: 3}}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="إلى تاريخ"
                  value={dateTo}
                  onChange={setDateTo}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid  size={{xs: 12, md: 2}}>
              <TextField
                label="معرف المتجر"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                fullWidth
                placeholder="اختياري"
              />
            </Grid>

              <Grid  size={{xs: 12, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="الحالة"
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="completed">مكتمل</MenuItem>
                  <MenuItem value="pending">معلق</MenuItem>
                  <MenuItem value="cancelled">ملغي</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid  size={{xs: 12, md: 2}}>
              <FormControl fullWidth>
                <InputLabel>التنسيق</InputLabel>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'excel')}
                  label="التنسيق"
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ملخص البيانات */}
          {dataSummaries && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                ملخص البيانات
              </Typography>
              <Grid container spacing={2}>
                {(['sales', 'payouts', 'orders'] as ReportType[]).map((type) => {
                  const summary = dataSummaries[type];
                  if (!summary) return null;

                  return (
                      <Grid  size={{xs: 12, md: 4}} key={type}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {getReportTitle(type)}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              الإجمالي:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatCurrency(summary.totalAmount)} ر.ي
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              العدد:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {summary.totalRecords} سجل
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* شبكة التقارير */}
      <Grid container spacing={3}>
        <Grid  size={{xs: 12, md: 6, lg: 4}}>
          <ReportCard
            title={getReportTitle('sales')}
            description={getReportDescription('sales')}
            icon={getReportIcon('sales')}
            onExport={() => handleExport('sales')}
            loading={isExporting}
            exportProgress={exportProgress}
          />
        </Grid>

        <Grid  size={{xs: 12, md: 6, lg: 4}}>
          <ReportCard
            title={getReportTitle('payouts')}
            description={getReportDescription('payouts')}
            icon={getReportIcon('payouts')}
            onExport={() => handleExport('payouts')}
            loading={isExporting}
            exportProgress={exportProgress}
          />
        </Grid>

        <Grid  size={{xs: 12, md: 6, lg: 4}}>
          <ReportCard
            title={getReportTitle('orders')}
            description={getReportDescription('orders')}
            icon={getReportIcon('orders')}
            onExport={() => handleExport('orders')}
            loading={isExporting}
            exportProgress={exportProgress}
          />
        </Grid>

        <Grid  size={{xs: 12, md: 6, lg: 4}}>
          <ReportCard
            title={getReportTitle('fees-taxes')}
            description={getReportDescription('fees-taxes')}
            icon={getReportIcon('fees-taxes')}
            onExport={() => handleExport('fees-taxes')}
            loading={isExporting}
            exportProgress={exportProgress}
          />
        </Grid>

        <Grid  size={{xs: 12, md: 6, lg: 4}}>
          <ReportCard
            title={getReportTitle('refunds')}
            description={getReportDescription('refunds')}
            icon={getReportIcon('refunds')}
            onExport={() => handleExport('refunds')}
            loading={isExporting}
            exportProgress={exportProgress}
          />
        </Grid>

        {/* كرت فحص المطابقة */}
        <Grid  size={{xs: 12, md: 6, lg: 4}}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CompareIcon color="primary" />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">فحص المطابقة</Typography>
                  <Typography variant="body2" color="text.secondary">
                    التحقق من تطابق البيانات بين الشاشات والملفات
                  </Typography>
                </Box>
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>نوع التقرير</InputLabel>
                <Select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                  label="نوع التقرير"
                >
                  <MenuItem value="sales">المبيعات</MenuItem>
                  <MenuItem value="payouts">المدفوعات</MenuItem>
                  <MenuItem value="orders">الطلبات</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={() => {
                    if (selectedReport === 'sales' || selectedReport === 'payouts' || selectedReport === 'orders') {
                      handleValidate(selectedReport);
                    }
                  }}
                  disabled={validateMutation.isPending}
                  fullWidth
                >
                  فحص المطابقة
                </Button>

                <Typography variant="caption" color="text.secondary">
                  الإجمالي الحالي: {formatCurrency(uiTotals[selectedReport].total)} ر.ي
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  العدد الحالي: {uiTotals[selectedReport].count} سجل
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* رسائل الخطأ والنجاح */}
      {validateMutation.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          فشل في فحص المطابقة: {validateMutation.error.message}
        </Alert>
      )}

      {/* Dialog فحص المطابقة */}
      <ValidationDialog
        open={validationDialog.open}
        onClose={() => {
          setValidationDialog({ open: false, reportType: 'orders' });
          setValidationResult(null);
        }}
        reportType={validationDialog.reportType}
        result={validationResult}
        loading={validateMutation.isPending}
      />

      {summariesLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
