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
  Paper,
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
  Receipt as TransactionIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingDown as TrendingDownIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import {
  getWalletTransactions,
  getWalletStats,
  type WalletTransaction
} from '../../api/wallet';

const TransactionDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  transaction: WalletTransaction | null;
}> = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

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

  const getTypeColor = (type: string) => {
    return type === 'credit' ? 'success' : 'error';
  };

  const getTypeIcon = (type: string) => {
    return type === 'credit' ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'reversed': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'معلقة';
      case 'failed': return 'فاشلة';
      case 'reversed': return 'معكوسة';
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'agent': return 'وكيل';
      case 'card': return 'بطاقة';
      case 'transfer': return 'تحويل';
      case 'payment': return 'دفع';
      case 'escrow': return 'إيداع';
      case 'reward': return 'مكافأة';
      case 'kuraimi': return 'كريمي';
      case 'withdrawal': return 'سحب';
      default: return method;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        تفاصيل المعاملة
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معلومات المعاملة
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">المعرف:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {transaction._id}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">النوع:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(transaction.type)}
                        <Chip
                          label={transaction.type === 'credit' ? 'إضافة' : 'خصم'}
                          color={getTypeColor(transaction.type)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">الطريقة:</Typography>
                      <Typography variant="body2">{getMethodText(transaction.method)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">الحالة:</Typography>
                      <Chip
                        label={getStatusText(transaction.status)}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">التاريخ:</Typography>
                      <Typography variant="body2">{formatDate(transaction.createdAt || '')}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    التفاصيل المالية
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">المبلغ:</Typography>
                      <Typography
                        variant="h6"
                        color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)} ر.ي
                      </Typography>
                    </Box>
                    {transaction.bankRef && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">رقم المرجع البنكي:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {transaction.bankRef}
                        </Typography>
                      </Box>
                    )}
                    {transaction.description && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">الوصف:</Typography>
                        <Typography variant="body2">{transaction.description}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {transaction.meta && (
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      البيانات الإضافية
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(transaction.meta, null, 2)}
                      </pre>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function TransactionTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<dayjs.Dayjs | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['walletTransactions'],
    queryFn: () => getWalletTransactions(),
  });

  // Fetch wallet statistics
  const { data: stats } = useQuery({
    queryKey: ['walletStats'],
    queryFn: () => getWalletStats('all'),
  });

  const transactions = transactionsData?.data || [];

  const filteredTransactions = transactions.filter((transaction: WalletTransaction) => {
    const matchesSearch =
      transaction._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.bankRef?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || transaction.type === typeFilter;
    const matchesStatus = !statusFilter || transaction.status === statusFilter;
    const matchesMethod = !methodFilter || transaction.method === methodFilter;

    const transactionDate = dayjs(transaction.createdAt);
    const matchesDateFrom = !dateFrom || transactionDate.isAfter(dateFrom.startOf('day'));
    const matchesDateTo = !dateTo || transactionDate.isBefore(dateTo.endOf('day'));

    return matchesSearch && matchesType && matchesStatus && matchesMethod && matchesDateFrom && matchesDateTo;
  });

  const handleViewDetails = (transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  };

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

  const getTypeColor = (type: string) => {
    return type === 'credit' ? 'success' : 'error';
  };

  const getTypeIcon = (type: string) => {
    return type === 'credit' ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'reversed': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'معلقة';
      case 'failed': return 'فاشلة';
      case 'reversed': return 'معكوسة';
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'agent': return 'وكيل';
      case 'card': return 'بطاقة';
      case 'transfer': return 'تحويل';
      case 'payment': return 'دفع';
      case 'escrow': return 'إيداع';
      case 'reward': return 'مكافأة';
      case 'kuraimi': return 'كريمي';
      case 'withdrawal': return 'سحب';
      default: return method;
    }
  };

  const getMethodColor = (method: string): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (method) {
      case 'agent': return 'primary';
      case 'card': return 'secondary';
      case 'transfer': return 'info';
      case 'payment': return 'success';
      case 'escrow': return 'warning';
      case 'reward': return 'error';
      case 'kuraimi': return 'secondary';
      case 'withdrawal': return 'default';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطأ في تحميل المعاملات: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          تتبع المعاملات
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            تصدير
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['walletTransactions'] })}
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
                  <TransactionIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalTransactions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المعاملات
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
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(filteredTransactions
                        .filter((t: WalletTransaction) => t.type === 'credit' && t.status === 'completed')
                        .reduce((sum: number, t: WalletTransaction) => sum + t.amount, 0)
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الإضافات
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
                  <TrendingDownIcon color="error" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(filteredTransactions
                        .filter((t: WalletTransaction) => t.type === 'debit' && t.status === 'completed')
                        .reduce((sum: number, t: WalletTransaction) => sum + t.amount, 0)
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الخصوم
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
                  <WalletIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.transactionsToday || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معاملات اليوم
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
              placeholder="البحث في المعاملات..."
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
              <InputLabel>النوع</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="النوع"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="credit">إضافة</MenuItem>
                <MenuItem value="debit">خصم</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="completed">مكتملة</MenuItem>
                <MenuItem value="pending">معلقة</MenuItem>
                <MenuItem value="failed">فاشلة</MenuItem>
                <MenuItem value="reversed">معكوسة</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الطريقة</InputLabel>
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                label="الطريقة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="agent">وكيل</MenuItem>
                <MenuItem value="card">بطاقة</MenuItem>
                <MenuItem value="transfer">تحويل</MenuItem>
                <MenuItem value="payment">دفع</MenuItem>
                <MenuItem value="escrow">إيداع</MenuItem>
                <MenuItem value="reward">مكافأة</MenuItem>
                <MenuItem value="kuraimi">كريمي</MenuItem>
                <MenuItem value="withdrawal">سحب</MenuItem>
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
              label={`${filteredTransactions.length} معاملة`}
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
                  <TableCell>المعرف</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>الطريقة</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction: WalletTransaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {transaction._id?.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(transaction.type)}
                        <Chip
                          label={transaction.type === 'credit' ? 'إضافة' : 'خصم'}
                          color={getTypeColor(transaction.type)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          color: transaction.type === 'credit' ? 'success.main' : 'error.main'
                        }}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMethodText(transaction.method)}
                        color={getMethodColor(transaction.method)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(transaction.status)}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt || '')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(transaction)}
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

      {filteredTransactions.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <TransactionIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد معاملات</Typography>
          <Typography variant="body2">
            {searchTerm || typeFilter || statusFilter || methodFilter || dateFrom || dateTo
              ? 'جرب مصطلح بحث مختلف أو تغيير الفلاتر'
              : 'لا توجد معاملات لعرضها'
            }
          </Typography>
        </Box>
      )}

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </Box>
  );
}
