import React, { useEffect, useState, useCallback } from "react";
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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  getAmaniList,
  updateAmaniStatus,
  deleteAmani,
  type AmaniItem as ApiAmaniItem,
} from "../../../api/amani";
import {
  AmaniStatus,
  AmaniStatusLabels,
  AmaniStatusColors,
  type AmaniItem,
} from "../../../types/amani";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const AmaniListPage: React.FC = () => {
  const navigate = useNavigate();
  const [amaniItems, setAmaniItems] = useState<AmaniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    amani: AmaniItem | null;
    action: "update_status" | "delete";
    newStatus?: AmaniStatus;
  }>({
    open: false,
    amani: null,
    action: "update_status",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // جلب قائمة الأماني
  const fetchAmaniItems = useCallback(
    async (cursor?: string, append: boolean = false) => {
      try {
        setLoading(true);
        const params: any = { limit: 25 };
        if (cursor) params.cursor = cursor;
        if (statusFilter && statusFilter !== "all")
          params.status = statusFilter;

        const response = await getAmaniList(params);
        const apiItems: ApiAmaniItem[] = response.items || [];

        // Convert string status to AmaniStatus enum
        const statusMap: Record<string, AmaniStatus> = {
          draft: AmaniStatus.DRAFT,
          pending: AmaniStatus.PENDING,
          confirmed: AmaniStatus.CONFIRMED,
          in_progress: AmaniStatus.IN_PROGRESS,
          completed: AmaniStatus.COMPLETED,
          cancelled: AmaniStatus.CANCELLED,
        };

        const newItems: AmaniItem[] = apiItems.map(
          (item: ApiAmaniItem): AmaniItem => ({
            ...item,
            status: statusMap[item.status] || AmaniStatus.DRAFT,
          })
        );

        setAmaniItems((prev: AmaniItem[]) =>
          append ? [...prev, ...newItems] : newItems
        );
        setNextCursor(response.nextCursor || null);
        setHasMore(!!response.nextCursor && newItems.length === 25);
      } catch (error) {
        console.error("خطأ في جلب قائمة الأماني:", error);
        setSnackbar({
          open: true,
          message: "فشل في تحميل قائمة الأماني",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchAmaniItems();
  }, [fetchAmaniItems, statusFilter]);

  // تحديث حالة الطلب
  const handleStatusUpdate = async (
    amani: AmaniItem,
    newStatus: AmaniStatus
  ) => {
    try {
      await updateAmaniStatus(amani._id, newStatus as string);
      setSnackbar({
        open: true,
        message: `تم تحديث حالة الطلب بنجاح`,
        severity: "success",
      });
      fetchAmaniItems();
    } catch (error) {
      console.error("خطأ في تحديث حالة الطلب:", error);
      setSnackbar({
        open: true,
        message: "فشل في تحديث حالة الطلب",
        severity: "error",
      });
    }
  };

  // حذف الطلب
  const handleDeleteAmani = async (amani: AmaniItem) => {
    try {
      await deleteAmani(amani._id);
      setSnackbar({
        open: true,
        message: "تم حذف الطلب بنجاح",
        severity: "success",
      });
      fetchAmaniItems();
    } catch (error) {
      console.error("خطأ في حذف الطلب:", error);
      setSnackbar({
        open: true,
        message: "فشل في حذف الطلب",
        severity: "error",
      });
    }
  };

  // فتح نافذة التأكيد
  const openConfirmDialog = (
    amani: AmaniItem,
    action: "update_status" | "delete",
    newStatus?: AmaniStatus
  ) => {
    setConfirmDialog({ open: true, amani, action, newStatus });
  };

  // إغلاق نافذة التأكيد
  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, amani: null, action: "update_status" });
  };

  // تأكيد العملية
  const confirmAction = async () => {
    if (!confirmDialog.amani) return;

    const { amani, action, newStatus } = confirmDialog;

    switch (action) {
      case "update_status":
        if (newStatus) await handleStatusUpdate(amani, newStatus);
        break;
      case "delete":
        await handleDeleteAmani(amani);
        break;
    }

    closeConfirmDialog();
  };

  // فلترة العناصر محلياً للبحث (الحالة تُطبق من السيرفر)
  const filteredItems = amaniItems.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  // تحميل المزيد
  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchAmaniItems(nextCursor, true);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: AmaniStatus) => {
    return AmaniStatusColors[status] || "default";
  };

  return (
    <RequireAdminPermission permission="read">
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              إدارة الأماني
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إدارة طلبات الأماني ومتابعة حالاتها
            </Typography>
          </Box>
        </Box>

        {/* فلاتر البحث */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              placeholder="البحث في الأماني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="all">جميع الحالات</MenuItem>
                {Object.values(AmaniStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {AmaniStatusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* جدول الأماني */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الطلب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>سائقة أنثى</TableCell>
                <TableCell>السائق</TableCell>
                <TableCell>الموقع</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && amaniItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      لا توجد طلبات متاحة
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.title}
                          </Typography>
                          {item.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {item.description.length > 50
                                ? `${item.description.substring(0, 50)}...`
                                : item.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={AmaniStatusLabels[item.status]}
                        size="small"
                        color={getStatusColor(item.status)}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      {item.metadata?.womenOnly ? (
                        <Chip
                          label="سائقة أنثى"
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {item.driver ? (
                        <Typography variant="body2">
                          {typeof item.driver === "object"
                            ? (item.driver as { fullName?: string }).fullName ||
                              "—"
                            : "—"}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.origin?.address ||
                            item.destination?.address ||
                            "غير محدد"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/amani/${item._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="تغيير الحالة">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              openConfirmDialog(
                                item,
                                "update_status",
                                AmaniStatus.CONFIRMED
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openConfirmDialog(item, "delete")}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* زر تحميل المزيد */}
          {hasMore && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? "جاري التحميل..." : "تحميل المزيد"}
              </Button>
            </Box>
          )}
        </Paper>

        {/* نافذة التأكيد */}
        <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
          <DialogTitle>تأكيد العملية</DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === "update_status" &&
                confirmDialog.newStatus && (
                  <>
                    هل أنت متأكد من تغيير حالة الطلب "
                    {confirmDialog.amani?.title}" إلى "
                    {AmaniStatusLabels[confirmDialog.newStatus]}"؟
                  </>
                )}
              {confirmDialog.action === "delete" && (
                <>هل أنت متأكد من حذف الطلب "{confirmDialog.amani?.title}"؟</>
              )}
            </Typography>
            {confirmDialog.action === "delete" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                هذا الإجراء لا يمكن التراجع عنه
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog}>إلغاء</Button>
            <Button
              onClick={confirmAction}
              variant="contained"
              color={confirmDialog.action === "delete" ? "error" : "primary"}
            >
              تأكيد
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar للرسائل */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default AmaniListPage;
