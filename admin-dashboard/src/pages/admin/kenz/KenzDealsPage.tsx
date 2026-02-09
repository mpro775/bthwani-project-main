import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  getKenzDeals,
  type KenzDealItem,
  type KenzDealStatus,
} from "../../../api/kenz";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const dealStatusLabels: Record<KenzDealStatus, string> = {
  pending: "قيد الانتظار",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const dealStatusColors: Record<
  KenzDealStatus,
  "warning" | "success" | "default"
> = {
  pending: "warning",
  completed: "success",
  cancelled: "default",
};

const KenzDealsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<KenzDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<KenzDealStatus | "">("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadDeals = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) setLoadingMore(true);
        else setLoading(true);

        const params: {
          cursor?: string;
          limit?: number;
          status?: KenzDealStatus;
        } = {
          limit: 25,
        };
        if (!loadMore && statusFilter) params.status = statusFilter;
        if (loadMore && nextCursor) params.cursor = nextCursor;

        const response = await getKenzDeals(params);
        if (loadMore) {
          setItems((prev) => [...prev, ...response.items]);
        } else {
          setItems(response.items);
        }
        setNextCursor(response.nextCursor);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "فشل في تحميل صفقات الإيكرو",
          severity: "error",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, nextCursor]
  );

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "YER",
    }).format(amount);
  };

  const getKenzId = (item: KenzDealItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "_id" in item.kenzId
      ? (item.kenzId as { _id: string })._id
      : String(item.kenzId);

  const getBuyerName = (item: KenzDealItem) =>
    typeof item.buyerId === "object" && item.buyerId !== null
      ? (item.buyerId as { fullName?: string }).fullName ||
        (item.buyerId as { phone?: string }).phone ||
        "—"
      : "—";

  const getSellerName = (item: KenzDealItem) =>
    typeof item.sellerId === "object" && item.sellerId !== null
      ? (item.sellerId as { fullName?: string }).fullName ||
        (item.sellerId as { phone?: string }).phone ||
        "—"
      : "—";

  const getKenzTitle = (item: KenzDealItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "title" in item.kenzId
      ? (item.kenzId as { title?: string }).title || "—"
      : "—";

  return (
    <RequireAdminPermission>
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
            صفقات كنز (الإيكرو)
          </Typography>
          <Button
            startIcon={<ViewIcon />}
            onClick={() => navigate("/admin/kenz")}
          >
            العودة إلى إعلانات الكنز
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>حالة الصفقة</InputLabel>
            <Select
              value={statusFilter}
              label="حالة الصفقة"
              onChange={(e) =>
                setStatusFilter(e.target.value as KenzDealStatus | "")
              }
            >
              <MenuItem value="">الكل</MenuItem>
              {Object.entries(dealStatusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الإعلان</TableCell>
                <TableCell>المشتري</TableCell>
                <TableCell>البائع</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>إجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لا توجد صفقات إيكرو
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {getKenzTitle(item)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() =>
                          navigate(`/admin/kenz/${getKenzId(item)}`)
                        }
                      >
                        عرض الإعلان
                      </Button>
                    </TableCell>
                    <TableCell>{getBuyerName(item)}</TableCell>
                    <TableCell>{getSellerName(item)}</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={dealStatusLabels[item.status] || item.status}
                        size="small"
                        color={dealStatusColors[item.status] || "default"}
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          navigate(`/admin/kenz/${getKenzId(item)}`)
                        }
                      >
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {nextCursor && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => loadDeals(true)}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={16} /> : null}
            >
              {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
            </Button>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default KenzDealsPage;
