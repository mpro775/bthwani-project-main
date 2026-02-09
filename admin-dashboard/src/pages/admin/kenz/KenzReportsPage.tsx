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
import { Visibility as ViewIcon } from "@mui/icons-material";
import { getKenzReports, type KenzReportItem } from "../../../api/kenz";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const reportStatusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  reviewed: "تمت المراجعة",
  rejected: "مرفوض",
  action_taken: "تم الإجراء",
};

const KenzReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<KenzReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
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

  const loadReports = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) setLoadingMore(true);
        else setLoading(true);

        const params: { cursor?: string; limit?: number; status?: string } = {
          limit: 25,
        };
        if (!loadMore && statusFilter) params.status = statusFilter;
        if (loadMore && nextCursor) params.cursor = nextCursor;

        const response = await getKenzReports(params);
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
          message: "فشل في تحميل البلاغات",
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
    loadReports();
  }, [loadReports]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const kenzId = (item: KenzReportItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "_id" in item.kenzId
      ? (item.kenzId as { _id: string })._id
      : String(item.kenzId);

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
            بلاغات إعلانات الكنز
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
            <InputLabel>حالة البلاغ</InputLabel>
            <Select
              value={statusFilter}
              label="حالة البلاغ"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">الكل</MenuItem>
              {Object.entries(reportStatusLabels).map(([value, label]) => (
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
                <TableCell>المبلّغ</TableCell>
                <TableCell>السبب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>إجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لا توجد بلاغات
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {typeof item.kenzId === "object" &&
                        item.kenzId !== null &&
                        "title" in item.kenzId
                          ? (item.kenzId as { title?: string }).title
                          : "—"}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => navigate(`/admin/kenz/${kenzId(item)}`)}
                      >
                        عرض الإعلان
                      </Button>
                    </TableCell>
                    <TableCell>
                      {typeof item.reporterId === "object" &&
                      item.reporterId !== null
                        ? (item.reporterId as { name?: string }).name ||
                          (item.reporterId as { email?: string }).email ||
                          "—"
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.reason}</Typography>
                      {item.notes && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {item.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reportStatusLabels[item.status] || item.status}
                        size="small"
                        color={
                          item.status === "pending" ? "warning" : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/admin/kenz/${kenzId(item)}`)}
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
              onClick={() => loadReports(true)}
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

export default KenzReportsPage;
