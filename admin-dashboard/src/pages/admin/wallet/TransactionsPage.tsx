import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import "dayjs/locale/ar";
import { useQuery } from "@tanstack/react-query";
import {
  getAllTransactions,
  getUserWalletForAdmin,
  type WalletTransaction,
} from "../../../api/wallet";

const TransactionDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  transaction: WalletTransaction | null;
}> = ({ open, onClose, transaction }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (transaction && open) {
      loadUserInfo();
    }
  }, [transaction, open]);

  const loadUserInfo = async () => {
    if (!transaction?.userId) return;

    try {
      setLoading(true);
      const data = await getUserWalletForAdmin(
        typeof transaction.userId === "string"
          ? transaction.userId
          : (transaction.userId as any)._id || transaction.userId
      );
      setUserInfo(data.user);
    } catch (error) {
      console.error("Error loading user info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "reversed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتملة";
      case "pending":
        return "معلقة";
      case "failed":
        return "فاشلة";
      case "reversed":
        return "معكوسة";
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      kuraimi: "كريمي",
      card: "بطاقة",
      transfer: "تحويل",
      payment: "دفع",
      escrow: "حجز",
      reward: "مكافأة",
      agent: "وكيل",
      withdrawal: "سحب",
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>تفاصيل المعاملة</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  المبلغ
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    transaction.type === "credit"
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {transaction.type === "credit" ? "+" : "-"}
                  {formatAmount(Math.abs(transaction.amount))} ر.ي
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  الحالة
                </Typography>
                <Chip
                  label={getStatusLabel(transaction.status || "completed")}
                  color={
                    getStatusColor(transaction.status || "completed") as any
                  }
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  النوع
                </Typography>
                <Typography variant="body1">
                  {transaction.type === "credit" ? "إيداع" : "سحب"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  الطريقة
                </Typography>
                <Typography variant="body1">
                  {getMethodLabel(transaction.method || "")}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  الوصف
                </Typography>
                <Typography variant="body1">
                  {transaction.description || "لا يوجد وصف"}
                </Typography>
              </Grid>
              {userInfo && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      معلومات المستخدم
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      الاسم
                    </Typography>
                    <Typography variant="body1">{userInfo.fullName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      البريد الإلكتروني
                    </Typography>
                    <Typography variant="body1">{userInfo.email}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      رقم الهاتف
                    </Typography>
                    <Typography variant="body1">{userInfo.phone}</Typography>
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  تاريخ المعاملة
                </Typography>
                <Typography variant="body1">
                  {new Date(transaction.createdAt || "").toLocaleString(
                    "ar-SA"
                  )}
                </Typography>
              </Grid>
              {transaction.bankRef && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    رقم المرجع
                  </Typography>
                  <Typography variant="body1">{transaction.bankRef}</Typography>
                </Grid>
              )}
              {transaction.meta && Object.keys(transaction.meta).length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    معلومات إضافية
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <pre style={{ margin: 0, fontSize: "0.875rem" }}>
                      {JSON.stringify(transaction.meta, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    userId: "",
    userModel: "",
    type: "",
    method: "",
    status: "",
    minAmount: "",
    maxAmount: "",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    search: "",
    orderId: "",
    refType: "",
  });
  const [cursor, setCursor] = useState<string | undefined>();
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch transactions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["walletTransactions", filters, cursor],
    queryFn: () =>
      getAllTransactions({
        userId: filters.userId || undefined,
        userModel: filters.userModel || undefined,
        type: filters.type || undefined,
        method: filters.method || undefined,
        status: filters.status || undefined,
        minAmount: filters.minAmount
          ? parseFloat(filters.minAmount)
          : undefined,
        maxAmount: filters.maxAmount
          ? parseFloat(filters.maxAmount)
          : undefined,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        search: filters.search || undefined,
        cursor,
        limit: 50,
      }),
  });

  const transactions = data?.data || [];
  const hasMore = data?.pagination?.hasMore || false;
  const nextCursor = data?.pagination?.nextCursor;

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCursor(undefined);
  };

  const handleClearFilters = () => {
    setFilters({
      userId: "",
      userModel: "",
      type: "",
      method: "",
      status: "",
      minAmount: "",
      maxAmount: "",
      startDate: null,
      endDate: null,
      search: "",
      orderId: "",
      refType: "",
    });
    setCursor(undefined);
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };

  const handleExport = () => {
    // TODO: Implement export to CSV/Excel
    alert("ميزة التصدير ستكون متاحة قريباً");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "reversed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتملة";
      case "pending":
        return "معلقة";
      case "failed":
        return "فاشلة";
      case "reversed":
        return "معكوسة";
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      kuraimi: "كريمي",
      card: "بطاقة",
      transfer: "تحويل",
      payment: "دفع",
      escrow: "حجز",
      reward: "مكافأة",
      agent: "وكيل",
      withdrawal: "سحب",
    };
    return methods[method] || method;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            تتبع المعاملات
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              تحديث
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              تصدير
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="البحث"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    endAdornment: filters.search && (
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("search", "")}
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>النوع</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    label="النوع"
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="credit">إيداع</MenuItem>
                    <MenuItem value="debit">سحب</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>الطريقة</InputLabel>
                  <Select
                    value={filters.method}
                    onChange={(e) =>
                      handleFilterChange("method", e.target.value)
                    }
                    label="الطريقة"
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="kuraimi">كريمي</MenuItem>
                    <MenuItem value="card">بطاقة</MenuItem>
                    <MenuItem value="transfer">تحويل</MenuItem>
                    <MenuItem value="payment">دفع</MenuItem>
                    <MenuItem value="escrow">حجز</MenuItem>
                    <MenuItem value="reward">مكافأة</MenuItem>
                    <MenuItem value="agent">وكيل</MenuItem>
                    <MenuItem value="withdrawal">سحب</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    label="الحالة"
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="pending">معلقة</MenuItem>
                    <MenuItem value="completed">مكتملة</MenuItem>
                    <MenuItem value="failed">فاشلة</MenuItem>
                    <MenuItem value="reversed">معكوسة</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>نوع المستخدم</InputLabel>
                  <Select
                    value={filters.userModel}
                    onChange={(e) =>
                      handleFilterChange("userModel", e.target.value)
                    }
                    label="نوع المستخدم"
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="User">مستخدم</MenuItem>
                    <MenuItem value="Driver">سائق</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="معرف الحجز (bookingId)"
                  value={filters.orderId}
                  onChange={(e) =>
                    handleFilterChange("orderId", e.target.value)
                  }
                  fullWidth
                  placeholder="للبحث عن معاملات حجز معين"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>نوع حجز العربون</InputLabel>
                  <Select
                    value={filters.refType}
                    onChange={(e) =>
                      handleFilterChange("refType", e.target.value)
                    }
                    label="نوع حجز العربون"
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="booking_deposit">عربون - حجز</MenuItem>
                    <MenuItem value="booking_refund">عربون - استرداد</MenuItem>
                    <MenuItem value="booking_complete">عربون - إكمال</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="الحد الأدنى"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) =>
                    handleFilterChange("minAmount", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="الحد الأقصى"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    handleFilterChange("maxAmount", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker
                  label="تاريخ البداية"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange("startDate", date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <DatePicker
                  label="تاريخ النهاية"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange("endDate", date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  مسح الفلاتر
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            فشل في تحميل المعاملات
          </Alert>
        )}

        {/* Transactions Table */}
        {isLoading && transactions.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>المعرف</TableCell>
                    <TableCell>المستخدم</TableCell>
                    <TableCell>المبلغ</TableCell>
                    <TableCell>النوع</TableCell>
                    <TableCell>الطريقة</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell>التاريخ</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary">
                          لا توجد معاملات
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {transaction._id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {typeof transaction.userId === "object" &&
                          transaction.userId
                            ? (transaction.userId as any).fullName ||
                              "غير معروف"
                            : "غير معروف"}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={
                              transaction.type === "credit"
                                ? "success.main"
                                : "error.main"
                            }
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatAmount(Math.abs(transaction.amount))} ر.ي
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {transaction.type === "credit" ? "إيداع" : "سحب"}
                        </TableCell>
                        <TableCell>
                          {getMethodLabel(transaction.method || "")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(
                              transaction.status || "completed"
                            )}
                            color={
                              getStatusColor(
                                transaction.status || "completed"
                              ) as any
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.createdAt || "")}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setDetailsDialogOpen(true);
                            }}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Load More */}
            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={20} /> : "تحميل المزيد"}
                </Button>
              </Box>
            )}
          </>
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
    </LocalizationProvider>
  );
}
