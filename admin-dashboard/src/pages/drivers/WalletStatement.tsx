import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,

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
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Download as DownloadIcon,
  DateRange as DateIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  ArrowUpward as InflowIcon,
  ArrowDownward as OutflowIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getWalletBalance,
  getWalletStatement,
  exportWalletStatementToCSV,
  type StatementLine,
} from '../../api/finance';

const WalletStatementDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  accountId: string;
  dateFrom: dayjs.Dayjs | null;
  dateTo: dayjs.Dayjs | null;
  balanceState: string;
}> = ({ open, onClose, accountId, dateFrom, dateTo, balanceState }) => {

  // Helper to convert balanceState string to proper type
  const getBalanceState = (): 'available' | 'pending' | undefined => {
    if (balanceState === 'available' || balanceState === 'pending') {
      return balanceState as 'available' | 'pending';
    }
    return undefined;
  };

  // Fetch wallet statement
  const { data: statementData, isLoading, error } = useQuery({
    queryKey: ['wallet-statement', accountId, dateFrom, dateTo, balanceState],
    queryFn: () => getWalletStatement(accountId, {
      date_from: dateFrom?.format('YYYY-MM-DD'),
      date_to: dateTo?.format('YYYY-MM-DD'),
      balance_state: getBalanceState(),
    }),
    enabled: open && !!accountId,
  });

  const handleExportCSV = async () => {
    try {
      const blob = await exportWalletStatementToCSV(accountId, {
        date_from: dateFrom?.format('YYYY-MM-DD'),
        date_to: dateTo?.format('YYYY-MM-DD'),
        balance_state: getBalanceState(),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-statement-${accountId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!open) return null;

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

  const getTransactionIcon = (side: string) => {
    return side === 'credit' ? <InflowIcon color="success" /> : <OutflowIcon color="error" />;
  };

  const getTransactionColor = (side: string) => {
    return side === 'credit' ? 'success.main' : 'error.main';
  };

  const statementLines = statementData?.statement_lines || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        كشف المحفظة
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(
                          statementLines.reduce((sum, line) =>
                            line.side === 'credit' ? sum + line.amount : sum - line.amount, 0
                          )
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        صافي التحركات
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InflowIcon color="success" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(
                          statementLines
                            .filter((line: StatementLine) => line.side === 'credit')
                            .reduce((sum: number, line: StatementLine) => sum + line.amount, 0)
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إجمالي الدخل
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OutflowIcon color="error" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {formatCurrency(
                          statementLines
                            .filter((line: StatementLine) => line.side === 'debit')
                            .reduce((sum: number, line: StatementLine) => sum + line.amount, 0)
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إجمالي الخصم
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, sm: 6, md: 3}}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WalletIcon color="info" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {statementLines.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        عدد العمليات
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              تفاصيل العمليات ({statementLines.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              تصدير CSV
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              خطأ في تحميل كشف المحفظة: {error.message}
            </Alert>
          ) : (
            <Card>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>التاريخ</TableCell>
                      <TableCell>الوصف</TableCell>
                      <TableCell>نوع المرجع</TableCell>
                      <TableCell>رقم المرجع</TableCell>
                      <TableCell>النوع</TableCell>
                      <TableCell>المبلغ</TableCell>
                      <TableCell>حالة الرصيد</TableCell>
                      <TableCell>الرصيد الجاري</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statementLines.map((line: StatementLine) => (
                      <TableRow key={line._id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(line.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTransactionIcon(line.side)}
                            <Typography variant="body2">
                              {line.memo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={line.ref_type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {line.ref_id || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: getTransactionColor(line.side),
                                fontWeight: 'bold'
                              }}
                            >
                              {line.side === 'credit' ? '+' : '-'}
                            </Typography>
                            <Typography variant="body2">
                              {line.side === 'credit' ? 'دخل' : 'خصم'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              color: getTransactionColor(line.side),
                              fontWeight: 'bold'
                            }}
                          >
                            {formatCurrency(line.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={line.balance_state === 'available' ? 'متاح' : 'معلق'}
                            size="small"
                            color={line.balance_state === 'available' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatCurrency(line.running_balance)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function WalletStatement() {
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(dayjs().startOf('month'));
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(dayjs().endOf('month'));
  const [balanceState, setBalanceState] = useState('');
  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [accountId, setAccountId] = useState('');

  const queryClient = useQueryClient();

  // Fetch wallet balance
  const { data: walletData, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => getWalletBalance(),
  });

  React.useEffect(() => {
    if (walletData) {
      setAccountId(walletData.account.id);
    }
  }, [walletData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewStatement = () => {
    setStatementDialogOpen(true);
  };

  if (walletError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل بيانات المحفظة: {walletError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          كشف محفظتي
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<DateIcon />}
            onClick={handleViewStatement}
            disabled={!walletData}
          >
            عرض الكشف التفصيلي
          </Button>
        </Box>
      </Box>

      {walletLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : walletData ? (
        <>
          {/* Wallet Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid  size={{xs: 12, md: 6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معلومات الحساب
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">نوع الحساب:</Typography>
                      <Typography variant="body2">
                        {walletData.account.owner_type === 'driver' ? 'سائق' : 'تاجر'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">العملة:</Typography>
                      <Typography variant="body2">{walletData.account.currency}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">حالة الحساب:</Typography>
                      <Chip
                        label={walletData.account.status === 'active' ? 'نشط' : 'غير نشط'}
                        size="small"
                        color={walletData.account.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid  size={{xs: 12, md: 6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    الأرصدة الحالية
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="warning" />
                        <Typography variant="body2" color="text.secondary">رصيد معلق:</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(walletData.balance.pending_amount)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="success" />
                        <Typography variant="body2" color="text.secondary">رصيد متاح:</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                        {formatCurrency(walletData.balance.available_amount)}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">إجمالي الرصيد:</Typography>
                      <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {formatCurrency(walletData.balance.total_amount)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Transactions Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ملخص الفترة المحددة
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="من تاريخ"
                    value={dateFrom}
                    onChange={setDateFrom}
                    slotProps={{
                      textField: {
                        size: 'small',
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
                        size: 'small',
                        sx: { minWidth: 150 },
                      },
                    }}
                  />
                </LocalizationProvider>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>حالة الرصيد</InputLabel>
                  <Select
                    value={balanceState}
                    onChange={(e) => setBalanceState(e.target.value)}
                    label="حالة الرصيد"
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="pending">معلق</MenuItem>
                    <MenuItem value="available">متاح</MenuItem>
                  </Select>
                </FormControl>

                <Chip
                  label={`${dateFrom?.format('DD/MM/YYYY')} - ${dateTo?.format('DD/MM/YYYY')}`}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <WalletIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">عرض الكشف التفصيلي</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              اضغط على زر "عرض الكشف التفصيلي" لعرض جميع العمليات المالية في محفظتك
            </Typography>
          </Box>
        </>
      ) : null}

      {/* Wallet Statement Dialog */}
      <WalletStatementDialog
        open={statementDialogOpen}
        onClose={() => setStatementDialogOpen(false)}
        accountId={accountId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        balanceState={balanceState}
      />
    </Box>
  );
}
