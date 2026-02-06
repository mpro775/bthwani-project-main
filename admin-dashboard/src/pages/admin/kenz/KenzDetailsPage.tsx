import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import {
  getKenz,
  updateKenzStatus,
  deleteKenz,
  type KenzItem as ApiKenzItem,
} from "../../../api/kenz";
import {
  KenzStatus,
  KenzStatusLabels,
  KenzStatusColors,
  type KenzItem,
} from "../../../types/kenz";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const KenzDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kenz, setKenz] = useState<KenzItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<KenzStatus>(KenzStatus.DRAFT);
  const [statusNotes, setStatusNotes] = useState("");

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  useEffect(() => {
    if (id) {
      loadKenz();
    }
  }, [id]);

  const loadKenz = async () => {
    try {
      setLoading(true);
      const data: ApiKenzItem = await getKenz(id!);
      // Convert string status to KenzStatus enum
      const statusMap: Record<string, KenzStatus> = {
        draft: KenzStatus.DRAFT,
        pending: KenzStatus.PENDING,
        confirmed: KenzStatus.CONFIRMED,
        completed: KenzStatus.COMPLETED,
        cancelled: KenzStatus.CANCELLED,
      };
      const convertedData: KenzItem = {
        ...data,
        status: statusMap[data.status] || KenzStatus.DRAFT,
      };
      setKenz(convertedData);
      setNewStatus(statusMap[data.status] || KenzStatus.DRAFT);
    } catch (error) {
      console.error("خطأ في تحميل إعلان الكنز:", error);
      setSnackbar({
        open: true,
        message: "فشل في تحميل إعلان الكنز",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!kenz) return;

    try {
      setUpdatingStatus(true);
      await updateKenzStatus(kenz._id, {
        status: newStatus,
        notes: statusNotes,
      });
      setKenz({ ...kenz, status: newStatus });
      setStatusDialogOpen(false);
      setStatusNotes("");
      setSnackbar({
        open: true,
        message: "تم تحديث حالة الإعلان بنجاح",
        severity: "success",
      });
    } catch (error) {
      console.error("خطأ في تحديث الحالة:", error);
      setSnackbar({
        open: true,
        message: "فشل في تحديث الحالة",
        severity: "error",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!kenz) return;

    try {
      await deleteKenz(kenz._id);
      setSnackbar({
        open: true,
        message: "تم حذف الإعلان بنجاح",
        severity: "success",
      });
      navigate("/admin/kenz");
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      setSnackbar({
        open: true,
        message: "فشل في حذف الإعلان",
        severity: "error",
      });
    }
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!kenz) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          لم يتم العثور على إعلان الكنز
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/kenz")}
          sx={{ mt: 2 }}
        >
          العودة للقائمة
        </Button>
      </Box>
    );
  }

  return (
    <RequireAdminPermission>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/admin/kenz")}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                تفاصيل إعلان الكنز
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إعلان رقم: {kenz._id}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setStatusDialogOpen(true)}
            >
              تحديث الحالة
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              حذف
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                معلومات الإعلان
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {kenz.title}
                </Typography>
                {kenz.category && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <CategoryIcon fontSize="small" color="action" />
                    <Chip label={kenz.category} variant="outlined" />
                  </Box>
                )}
              </Box>

              {kenz.description && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="h6">الوصف</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {kenz.description}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <MoneyIcon fontSize="small" color="action" />
                  <Typography variant="h6">السعر</Typography>
                </Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatCurrency(kenz.price)}
                </Typography>
              </Box>

              {Object.keys(kenz.metadata).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    بيانات إضافية
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {Object.entries(kenz.metadata).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Status Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الحالة
                </Typography>
                <Chip
                  label={KenzStatusLabels[kenz.status]}
                  color={KenzStatusColors[kenz.status]}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  آخر تحديث: {formatDate(kenz.updatedAt)}
                </Typography>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات المالك
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {kenz.owner?.name || "غير محدد"}
                    </Typography>
                    {kenz.owner?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {kenz.owner.email}
                      </Typography>
                    )}
                    {kenz.owner?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {kenz.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* نشر بالنيابة */}
            {(kenz.postedOnBehalfOfPhone ||
              (typeof kenz.postedOnBehalfOfUserId === "object" &&
                kenz.postedOnBehalfOfUserId)) && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    نشر بالنيابة عن
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {typeof kenz.postedOnBehalfOfUserId === "object" &&
                    kenz.postedOnBehalfOfUserId?.name
                      ? `${kenz.postedOnBehalfOfUserId.name}${
                          kenz.postedOnBehalfOfUserId?.phone
                            ? ` (${kenz.postedOnBehalfOfUserId.phone})`
                            : ""
                        }`
                      : kenz.postedOnBehalfOfPhone
                      ? `رقم الهاتف: ${kenz.postedOnBehalfOfPhone}`
                      : "—"}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  التواريخ
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <TimeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(kenz.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      آخر تحديث
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(kenz.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Update Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>تحديث حالة الإعلان</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={newStatus}
                label="الحالة الجديدة"
                onChange={(e) => setNewStatus(e.target.value as KenzStatus)}
              >
                {Object.values(KenzStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {KenzStatusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="ملاحظات (اختياري)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="أضف ملاحظات حول سبب التغيير..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={updatingStatus}
              startIcon={updatingStatus ? <CircularProgress size={16} /> : null}
            >
              {updatingStatus ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <Typography>هل أنت متأكد من حذف إعلان "{kenz.title}"؟</Typography>
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

export default KenzDetailsPage;
