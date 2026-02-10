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
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  getKawaderList,
  updateKawaderStatus,
  deleteKawader,
  type KawaderItem,
} from "../../../api/kawader";
import {
  KawaderStatus,
  KawaderStatusLabels,
  KawaderStatusColors,
} from "../../../types/kawader";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const KawaderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [kawaderItems, setKawaderItems] = useState<KawaderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<KawaderStatus | "">("");
  const [budgetMinFilter, setBudgetMinFilter] = useState("");
  const [budgetMaxFilter, setBudgetMaxFilter] = useState("");
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<KawaderItem | null>(null);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadKawaderItems = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params: any = {
          limit: 25,
        };

        if (!loadMore) {
          // Only add filters for initial load
          if (searchTerm) params.search = searchTerm;
          if (statusFilter) params.status = statusFilter;
          if (budgetMinFilter) params.budgetMin = parseFloat(budgetMinFilter);
          if (budgetMaxFilter) params.budgetMax = parseFloat(budgetMaxFilter);
          if (offerTypeFilter) params.offerType = offerTypeFilter;
          if (jobTypeFilter) params.jobType = jobTypeFilter;
          if (locationFilter) params.location = locationFilter;
        } else if (nextCursor) {
          params.cursor = nextCursor;
        }

        const response = await getKawaderList(params);

        if (loadMore) {
          setKawaderItems((prev) => [...prev, ...response.items]);
        } else {
          setKawaderItems(response.items);
        }

        setNextCursor(response.nextCursor);
      } catch (error) {
        console.error("خطأ في تحميل عروض الكوادر:", error);
        setSnackbar({
          open: true,
          message: "فشل في تحميل عروض الكوادر",
          severity: "error",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      searchTerm,
      statusFilter,
      budgetMinFilter,
      budgetMaxFilter,
      offerTypeFilter,
      jobTypeFilter,
      locationFilter,
      nextCursor,
    ]
  );

  useEffect(() => {
    loadKawaderItems();
  }, [loadKawaderItems]);

  const handleStatusUpdate = async (id: string, newStatus: KawaderStatus) => {
    try {
      setUpdatingStatus(id);
      await updateKawaderStatus(id, { status: newStatus });
      setSnackbar({
        open: true,
        message: "تم تحديث حالة العرض بنجاح",
        severity: "success",
      });
      // Reload the list
      loadKawaderItems();
    } catch (error) {
      console.error("خطأ في تحديث الحالة:", error);
      setSnackbar({
        open: true,
        message: "فشل في تحديث الحالة",
        severity: "error",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteKawader(itemToDelete._id);
      setSnackbar({
        open: true,
        message: "تم حذف العرض بنجاح",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadKawaderItems();
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      setSnackbar({
        open: true,
        message: "فشل في حذف العرض",
        severity: "error",
      });
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/kawader/${id}`);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            إدارة عروض الكوادر
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/kawader/new")}
          >
            إضافة عرض جديد
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="البحث"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="ابحث في العناوين..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  label="الحالة"
                  onChange={(e) =>
                    setStatusFilter(e.target.value as KawaderStatus)
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(KawaderStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {KawaderStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="الميزانية من"
                type="number"
                value={budgetMinFilter}
                onChange={(e) => setBudgetMinFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">ر.س</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="الميزانية إلى"
                type="number"
                value={budgetMaxFilter}
                onChange={(e) => setBudgetMaxFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">ر.س</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>نوع العرض</InputLabel>
                <Select
                  value={offerTypeFilter}
                  label="نوع العرض"
                  onChange={(e) => setOfferTypeFilter(e.target.value as string)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="job">وظيفة</MenuItem>
                  <MenuItem value="service">خدمة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>نوع الوظيفة</InputLabel>
                <Select
                  value={jobTypeFilter}
                  label="نوع الوظيفة"
                  onChange={(e) => setJobTypeFilter(e.target.value as string)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="full_time">دوام كامل</MenuItem>
                  <MenuItem value="part_time">جزئي</MenuItem>
                  <MenuItem value="remote">عن بُعد</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="الموقع"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="مثال: صنعاء، عدن"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => loadKawaderItems()}
                  disabled={loading}
                >
                  فلترة
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setBudgetMinFilter("");
                    setBudgetMaxFilter("");
                    setOfferTypeFilter("");
                    setJobTypeFilter("");
                    setLocationFilter("");
                    loadKawaderItems();
                  }}
                >
                  إعادة تعيين
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>العنوان</TableCell>
                <TableCell>المالك</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>الموقع</TableCell>
                <TableCell>الميزانية / الراتب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : kawaderItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لا توجد عروض كوادر
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                kawaderItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        {item.scope && (
                          <Typography variant="body2" color="text.secondary">
                            {item.scope}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">
                            {item.owner?.name || "غير محدد"}
                          </Typography>
                          {item.owner?.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.owner.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          {item.offerType === "job"
                            ? "وظيفة"
                            : item.offerType === "service"
                            ? "خدمة"
                            : "غير محدد"}
                        </Typography>
                        {item.jobType && (
                          <Typography variant="caption" color="text.secondary">
                            {item.jobType === "full_time"
                              ? "دوام كامل"
                              : item.jobType === "part_time"
                              ? "جزئي"
                              : "عن بُعد"}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.location ||
                          (item.metadata?.location as string) ||
                          "غير محدد"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatCurrency(item.salary ?? item.budget)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              item._id,
                              e.target.value as KawaderStatus
                            )
                          }
                          disabled={updatingStatus === item._id}
                        >
                          {Object.values(KawaderStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              <Chip
                                label={KawaderStatusLabels[status]}
                                color={KawaderStatusColors[status]}
                                size="small"
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(item._id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
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
        </Paper>

        {/* Load More */}
        {nextCursor && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => loadKawaderItems(true)}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={16} /> : null}
            >
              {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
            </Button>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <Typography>
              هل أنت متأكد من حذف عرض "{itemToDelete?.title}"؟
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              هذا الإجراء لا يمكن التراجع عنه.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              حذف
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default KawaderListPage;
