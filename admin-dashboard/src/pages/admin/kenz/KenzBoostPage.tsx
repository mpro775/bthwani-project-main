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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Add as AddIcon, Visibility as ViewIcon } from "@mui/icons-material";
import {
  getKenzBoosts,
  createKenzBoost,
  cancelKenzBoost,
  type KenzBoostItem,
  type KenzBoostType,
  type KenzBoostStatus,
} from "../../../api/kenz";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const boostTypeLabels: Record<KenzBoostType, string> = {
  highlight: "تمييز",
  pin: "تثبيت",
  top: "أعلى القائمة",
};

const boostStatusLabels: Record<KenzBoostStatus, string> = {
  active: "نشط",
  expired: "منتهي",
  cancelled: "ملغي",
};

const KenzBoostPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<KenzBoostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<KenzBoostStatus | "">("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    kenzId: "",
    startDate: "",
    endDate: "",
    boostType: "highlight" as KenzBoostType,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadBoosts = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) setLoadingMore(true);
        else setLoading(true);
        const params: {
          cursor?: string;
          limit?: number;
          status?: KenzBoostStatus;
        } = {
          limit: 25,
        };
        if (!loadMore && statusFilter) params.status = statusFilter;
        if (loadMore && nextCursor) params.cursor = nextCursor;
        const response = await getKenzBoosts(params);
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
          message: "فشل في تحميل الترويجات",
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
    loadBoosts();
  }, [loadBoosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getKenzId = (item: KenzBoostItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "_id" in item.kenzId
      ? (item.kenzId as { _id: string })._id
      : String(item.kenzId);

  const handleCreateSubmit = async () => {
    if (
      !createForm.kenzId.trim() ||
      !createForm.startDate ||
      !createForm.endDate
    ) {
      setSnackbar({
        open: true,
        message: "يرجى تعبئة معرف الإعلان وتواريخ البداية والنهاية",
        severity: "error",
      });
      return;
    }
    setCreateSubmitting(true);
    try {
      await createKenzBoost({
        kenzId: createForm.kenzId.trim(),
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
        boostType: createForm.boostType,
      });
      setSnackbar({
        open: true,
        message: "تم إنشاء الترويج بنجاح",
        severity: "success",
      });
      setCreateOpen(false);
      setCreateForm({
        kenzId: "",
        startDate: "",
        endDate: "",
        boostType: "highlight",
      });
      loadBoosts();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "فشل في إنشاء الترويج (تأكد من معرف الإعلان والتواريخ)",
        severity: "error",
      });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleCancelBoost = async (id: string) => {
    try {
      await cancelKenzBoost(id);
      setSnackbar({
        open: true,
        message: "تم إلغاء الترويج",
        severity: "success",
      });
      setItems((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "cancelled" as KenzBoostStatus } : b
        )
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: "فشل في إلغاء الترويج",
        severity: "error",
      });
    }
  };

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
            ترويج إعلانات الكنز
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              startIcon={<ViewIcon />}
              onClick={() => navigate("/admin/kenz")}
            >
              إعلانات الكنز
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
            >
              إنشاء ترويج
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>حالة الترويج</InputLabel>
            <Select
              value={statusFilter}
              label="حالة الترويج"
              onChange={(e) =>
                setStatusFilter((e.target.value || "") as KenzBoostStatus | "")
              }
            >
              <MenuItem value="">الكل</MenuItem>
              {Object.entries(boostStatusLabels).map(([value, label]) => (
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
                <TableCell>نوع الترويج</TableCell>
                <TableCell>من</TableCell>
                <TableCell>إلى</TableCell>
                <TableCell>الحالة</TableCell>
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
                      لا توجد ترويجات
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
                          : getKenzId(item)}
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
                    <TableCell>
                      <Chip
                        label={
                          boostTypeLabels[item.boostType] || item.boostType
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.startDate)}</TableCell>
                    <TableCell>{formatDate(item.endDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={boostStatusLabels[item.status] || item.status}
                        size="small"
                        color={
                          item.status === "active"
                            ? "success"
                            : item.status === "cancelled"
                            ? "default"
                            : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {item.status === "active" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancelBoost(item._id)}
                        >
                          إلغاء الترويج
                        </Button>
                      )}
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
              onClick={() => loadBoosts(true)}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={16} /> : null}
            >
              {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
            </Button>
          </Box>
        )}

        <Dialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>إنشاء ترويج إعلان</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="معرف الإعلان (Kenz ID)"
              value={createForm.kenzId}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, kenzId: e.target.value }))
              }
              placeholder="مثال: 507f1f77bcf86cd799439011"
              sx={{ mt: 1 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>نوع الترويج</InputLabel>
              <Select
                value={createForm.boostType}
                label="نوع الترويج"
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    boostType: e.target.value as KenzBoostType,
                  }))
                }
              >
                {Object.entries(boostTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="datetime-local"
              label="تاريخ البداية"
              value={createForm.startDate}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, startDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="تاريخ النهاية"
              value={createForm.endDate}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, endDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>إلغاء</Button>
            <Button
              variant="contained"
              onClick={handleCreateSubmit}
              disabled={createSubmitting}
              startIcon={
                createSubmitting ? <CircularProgress size={16} /> : null
              }
            >
              {createSubmitting ? "جاري الحفظ..." : "إنشاء الترويج"}
            </Button>
          </DialogActions>
        </Dialog>

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

export default KenzBoostPage;
