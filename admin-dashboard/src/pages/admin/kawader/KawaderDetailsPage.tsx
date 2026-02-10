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
  Work as WorkIcon,
} from "@mui/icons-material";
import {
  getKawader,
  updateKawaderStatus,
  deleteKawader,
  getKawaderApplicationsAdmin,
  type KawaderItem as ApiKawaderItem,
  type KawaderApplicationItem,
} from "../../../api/kawader";
import {
  KawaderStatus,
  KawaderStatusLabels,
  KawaderStatusColors,
  type KawaderItem,
} from "../../../types/kawader";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const KawaderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kawader, setKawader] = useState<KawaderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<KawaderStatus>(
    KawaderStatus.DRAFT
  );
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

  // Applications
  const [applications, setApplications] = useState<KawaderApplicationItem[]>(
    []
  );
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    if (id) {
      loadKawader();
    }
  }, [id]);

  const loadKawader = async () => {
    try {
      setLoading(true);
      const data: ApiKawaderItem = await getKawader(id!);
      // Convert string status to KawaderStatus enum
      const statusMap: Record<string, KawaderStatus> = {
        draft: KawaderStatus.DRAFT,
        pending: KawaderStatus.PENDING,
        confirmed: KawaderStatus.CONFIRMED,
        completed: KawaderStatus.COMPLETED,
        cancelled: KawaderStatus.CANCELLED,
      };
      const convertedData: KawaderItem = {
        ...data,
        status: statusMap[data.status] || KawaderStatus.DRAFT,
      };
      setKawader(convertedData);
      setNewStatus(statusMap[data.status] || KawaderStatus.DRAFT);
    } catch (error) {
      console.error("خطأ في تحميل عرض الكادر:", error);
      setSnackbar({
        open: true,
        message: "فشل في تحميل عرض الكادر",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!id) return;
    try {
      setLoadingApplications(true);
      const items = await getKawaderApplicationsAdmin(id);
      setApplications(items);
    } catch (error) {
      console.error("خطأ في تحميل تقديمات الكادر:", error);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!kawader) return;

    try {
      setUpdatingStatus(true);
      await updateKawaderStatus(kawader._id, {
        status: newStatus,
        notes: statusNotes,
      });
      setKawader({ ...kawader, status: newStatus });
      setStatusDialogOpen(false);
      setStatusNotes("");
      setSnackbar({
        open: true,
        message: "تم تحديث حالة العرض بنجاح",
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
    if (!kawader) return;

    try {
      await deleteKawader(kawader._id);
      setSnackbar({
        open: true,
        message: "تم حذف العرض بنجاح",
        severity: "success",
      });
      navigate("/admin/kawader");
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      setSnackbar({
        open: true,
        message: "فشل في حذف العرض",
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

  if (!kawader) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          لم يتم العثور على عرض الكادر
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/kawader")}
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
            <IconButton onClick={() => navigate("/admin/kawader")}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                تفاصيل عرض الكادر
              </Typography>
              <Typography variant="body2" color="text.secondary">
                عرض رقم: {kawader._id}
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
                معلومات العرض
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {kawader.title}
                </Typography>
                {kawader.scope && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <WorkIcon fontSize="small" color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {kawader.scope}
                    </Typography>
                  </Box>
                )}
              </Box>

              {kawader.description && (
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
                    {kawader.description}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <MoneyIcon fontSize="small" color="action" />
                  <Typography variant="h6">الميزانية</Typography>
                </Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatCurrency(kawader.budget)}
                </Typography>
              </Box>

              {Object.keys(kawader.metadata).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    بيانات إضافية
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {Object.entries(kawader.metadata).map(([key, value]) => (
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

              {/* Applications for this kawader */}
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6">التقديمات على هذا العرض</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const next = !applicationsOpen;
                      setApplicationsOpen(next);
                      if (next && applications.length === 0) {
                        loadApplications();
                      }
                    }}
                    disabled={loadingApplications}
                  >
                    {applicationsOpen ? "إخفاء التقديمات" : "عرض التقديمات"}
                  </Button>
                </Box>
                <Collapse in={applicationsOpen}>
                  {loadingApplications ? (
                    <Box
                      sx={{ py: 2, display: "flex", justifyContent: "center" }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : applications.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      لا توجد تقديمات على هذا العرض
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        mt: 1,
                      }}
                    >
                      {applications.map((app) => (
                        <Paper key={app._id} sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {(typeof app.userId === "object" &&
                              app.userId &&
                              "name" in app.userId
                                ? (app.userId as any).name
                                : "مستخدم") || "مستخدم"}
                            </Typography>
                            <Chip
                              size="small"
                              label={
                                app.status === "pending"
                                  ? "قيد المراجعة"
                                  : app.status === "accepted"
                                  ? "مقبول"
                                  : "مرفوض"
                              }
                              color={
                                app.status === "accepted"
                                  ? "success"
                                  : app.status === "rejected"
                                  ? "error"
                                  : "default"
                              }
                            />
                          </Box>
                          {app.coverNote && (
                            <Typography variant="body2" color="text.secondary">
                              {app.coverNote}
                            </Typography>
                          )}
                          {app.createdAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              تاريخ التقديم: {formatDate(app.createdAt)}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Collapse>
              </Box>
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
                  label={KawaderStatusLabels[kawader.status]}
                  color={KawaderStatusColors[kawader.status]}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  آخر تحديث: {formatDate(kawader.updatedAt)}
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
                      {kawader.owner?.name || "غير محدد"}
                    </Typography>
                    {kawader.owner?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {kawader.owner.email}
                      </Typography>
                    )}
                    {kawader.owner?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {kawader.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

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
                      {formatDate(kawader.createdAt)}
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
                      {formatDate(kawader.updatedAt)}
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
          <DialogTitle>تحديث حالة العرض</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={newStatus}
                label="الحالة الجديدة"
                onChange={(e) => setNewStatus(e.target.value as KawaderStatus)}
              >
                {Object.values(KawaderStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {KawaderStatusLabels[status]}
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
            <Typography>هل أنت متأكد من حذف عرض "{kawader.title}"؟</Typography>
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

export default KawaderDetailsPage;
