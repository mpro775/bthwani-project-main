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
  Category as CategoryIcon,
  CheckCircle as SoldIcon,
} from "@mui/icons-material";
import {
  getKenzList,
  updateKenzStatus,
  deleteKenz,
  type KenzItem,
  type KenzSortOption,
  type KenzCondition,
  type KenzDeliveryOption,
} from "../../../api/kenz";
import {
  KenzStatus,
  KenzStatusLabels,
  KenzStatusColors,
  KenzCategories,
} from "../../../types/kenz";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const KenzListPage: React.FC = () => {
  const navigate = useNavigate();
  const [kenzItems, setKenzItems] = useState<KenzItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<KenzStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState<KenzCondition | "">(
    ""
  );
  const [deliveryOptionFilter, setDeliveryOptionFilter] = useState<
    "meetup" | "delivery" | "both" | ""
  >("");
  const [acceptsEscrowFilter, setAcceptsEscrowFilter] = useState<boolean | "">(
    ""
  );
  const [isAuctionFilter, setIsAuctionFilter] = useState<boolean | "">("");
  const [priceMinFilter, setPriceMinFilter] = useState("");
  const [priceMaxFilter, setPriceMaxFilter] = useState("");
  const [sortFilter, setSortFilter] = useState<KenzSortOption>("newest");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<KenzItem | null>(null);

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

  const loadKenzItems = useCallback(
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
          if (searchTerm) params.search = searchTerm;
          if (statusFilter) params.status = statusFilter;
          if (categoryFilter) params.category = categoryFilter;
          if (conditionFilter) params.condition = conditionFilter;
          if (deliveryOptionFilter)
            params.deliveryOption = deliveryOptionFilter;
          if (acceptsEscrowFilter === true) params.acceptsEscrow = true;
          if (isAuctionFilter === true) params.isAuction = true;
          if (priceMinFilter) params.priceMin = parseFloat(priceMinFilter);
          if (priceMaxFilter) params.priceMax = parseFloat(priceMaxFilter);
          if (sortFilter) params.sort = sortFilter;
        } else if (nextCursor) {
          params.cursor = nextCursor;
        }

        const response = await getKenzList(params);

        if (loadMore) {
          setKenzItems((prev) => [...prev, ...response.items]);
        } else {
          setKenzItems(response.items);
        }

        setNextCursor(response.nextCursor);
      } catch (error) {
        console.error("خطأ في تحميل إعلانات الكنز:", error);
        setSnackbar({
          open: true,
          message: "فشل في تحميل إعلانات الكنز",
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
      categoryFilter,
      conditionFilter,
      priceMinFilter,
      priceMaxFilter,
      sortFilter,
      nextCursor,
      acceptsEscrowFilter,
      isAuctionFilter,
    ]
  );

  useEffect(() => {
    loadKenzItems();
  }, [loadKenzItems]);

  const handleStatusUpdate = async (id: string, newStatus: KenzStatus) => {
    try {
      setUpdatingStatus(id);
      await updateKenzStatus(id, { status: newStatus });
      setSnackbar({
        open: true,
        message: "تم تحديث حالة الإعلان بنجاح",
        severity: "success",
      });
      // Reload the list
      loadKenzItems();
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
      await deleteKenz(itemToDelete._id);
      setSnackbar({
        open: true,
        message: "تم حذف الإعلان بنجاح",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadKenzItems();
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      setSnackbar({
        open: true,
        message: "فشل في حذف الإعلان",
        severity: "error",
      });
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/kenz/${id}`);
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
            إدارة إعلانات الكنز
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/kenz/new")}
          >
            إضافة إعلان جديد
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
                    setStatusFilter(e.target.value as KenzStatus)
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.values(KenzStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {KenzStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>الترتيب</InputLabel>
                <Select
                  value={sortFilter}
                  label="الترتيب"
                  onChange={(e) =>
                    setSortFilter(e.target.value as KenzSortOption)
                  }
                >
                  <MenuItem value="newest">الأحدث</MenuItem>
                  <MenuItem value="price_asc">السعر (أقل أولاً)</MenuItem>
                  <MenuItem value="price_desc">السعر (أعلى أولاً)</MenuItem>
                  <MenuItem value="views_desc">الأكثر مشاهدة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={categoryFilter}
                  label="الفئة"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  {KenzCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>حالة السلعة</InputLabel>
                <Select
                  value={conditionFilter}
                  label="حالة السلعة"
                  onChange={(e) =>
                    setConditionFilter(
                      (e.target.value || "") as KenzCondition | ""
                    )
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="new">جديد</MenuItem>
                  <MenuItem value="used">مستعمل</MenuItem>
                  <MenuItem value="refurbished">مجدد</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>طريقة التسليم</InputLabel>
                <Select
                  value={deliveryOptionFilter}
                  label="طريقة التسليم"
                  onChange={(e) =>
                    setDeliveryOptionFilter(
                      (e.target.value || "") as KenzDeliveryOption | ""
                    )
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="meetup">لقاء</MenuItem>
                  <MenuItem value="delivery">توصيل</MenuItem>
                  <MenuItem value="both">لقاء وتوصيل</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>الإيكرو</InputLabel>
                <Select
                  value={
                    acceptsEscrowFilter === ""
                      ? ""
                      : acceptsEscrowFilter
                      ? "yes"
                      : "no"
                  }
                  label="الإيكرو"
                  onChange={(e) =>
                    setAcceptsEscrowFilter(
                      e.target.value === "" ? "" : e.target.value === "yes"
                    )
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="yes">يقبل الإيكرو فقط</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>المزاد</InputLabel>
                <Select
                  value={
                    isAuctionFilter === "" ? "" : isAuctionFilter ? "yes" : "no"
                  }
                  label="المزاد"
                  onChange={(e) =>
                    setIsAuctionFilter(
                      e.target.value === "" ? "" : e.target.value === "yes"
                    )
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="yes">مزادات فقط</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="السعر من"
                type="number"
                value={priceMinFilter}
                onChange={(e) => setPriceMinFilter(e.target.value)}
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
                label="السعر إلى"
                type="number"
                value={priceMaxFilter}
                onChange={(e) => setPriceMaxFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">ر.س</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => loadKenzItems()}
                  disabled={loading}
                >
                  فلترة
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button
                variant="text"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setCategoryFilter("");
                  setConditionFilter("");
                  setDeliveryOptionFilter("");
                  setAcceptsEscrowFilter("");
                  setIsAuctionFilter("");
                  setSortFilter("newest");
                  setPriceMinFilter("");
                  setPriceMaxFilter("");
                  loadKenzItems();
                }}
              >
                إعادة تعيين
              </Button>
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
                <TableCell>نشر بالنيابة</TableCell>
                <TableCell>السعر</TableCell>
                <TableCell>الفئة</TableCell>
                <TableCell>الإيكرو</TableCell>
                <TableCell>مزاد</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : kenzItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لا توجد إعلانات كنز
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                kenzItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        {item.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.description}
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
                      {item.postedOnBehalfOfPhone ||
                      (typeof item.postedOnBehalfOfUserId === "object" &&
                        item.postedOnBehalfOfUserId?.name) ? (
                        <Typography variant="body2" color="text.secondary">
                          {typeof item.postedOnBehalfOfUserId === "object" &&
                          item.postedOnBehalfOfUserId?.name
                            ? item.postedOnBehalfOfUserId.name
                            : item.postedOnBehalfOfPhone
                            ? `📱 ${String(item.postedOnBehalfOfPhone).replace(
                                /(\d{3})\d+(\d{3})/,
                                "$1***$2"
                              )}`
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
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatCurrency(item.price)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CategoryIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.category || "غير مصنف"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {item.acceptsEscrow ? (
                        <Chip
                          label="إيكرو"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isAuction ? (
                        <Chip
                          label="مزاد"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              item._id,
                              e.target.value as KenzStatus
                            )
                          }
                          disabled={updatingStatus === item._id}
                        >
                          {Object.values(KenzStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              <Chip
                                label={KenzStatusLabels[status]}
                                color={KenzStatusColors[status]}
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
                        {item.status !== KenzStatus.COMPLETED && (
                          <Tooltip title="تم البيع">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdate(
                                  item._id,
                                  KenzStatus.COMPLETED
                                )
                              }
                              disabled={updatingStatus === item._id}
                              color="success"
                            >
                              <SoldIcon />
                            </IconButton>
                          </Tooltip>
                        )}
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
              onClick={() => loadKenzItems(true)}
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
              هل أنت متأكد من حذف إعلان "{itemToDelete?.title}"؟
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

export default KenzListPage;
