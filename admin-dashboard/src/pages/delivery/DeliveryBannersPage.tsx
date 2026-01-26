import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  MenuItem,
  Switch,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "../../utils/axios";
import { auth } from "../../config/firebaseConfig";
import type {
  Banner,
  BannerForm,
  Category,
  DeliveryStore,
} from "../../type/delivery";
import { uploadFileToBunny } from "../../services/uploadFileToCloudinary";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";

// 🎨 مكونات مخصصة للنمط
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const ImageUploadButton = styled(Button)({
  height: 56,
  borderStyle: "dashed",
});

const StatusChip = styled(Chip)({
  fontWeight: "bold",
  minWidth: 80,
});

export default function DeliveryBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [stores, setStores] = useState<DeliveryStore[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<BannerForm>({
    title: "",
    description: "",
    link: "",
    storeId: "",
    categoryId: "",
    order: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    image: null,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) return;

      const res = await axios.get("/delivery/banners/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(res.data);
    } catch (err) {
      setError("فشل في تحميل البانرات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) return;
      const res = await axios.get("/delivery/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch {
      setError("فشل في تحميل المتاجر");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/delivery/categories");
      setCategories(res.data);
    } catch {
      setError("فشل في تحميل الفئات");
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchStores();
    fetchCategories();
  }, []);

  const handleSave = async (): Promise<void> => {
    try {
      setLoading(true);
      const { image: imageFile, ...rest } = form;

      const imageUrl = imageFile
        ? await uploadFileToBunny(imageFile)
        : editing?.image ?? "";

      const payload: Omit<Banner, "_id"> = {
        ...rest,
        image: imageUrl,
      };

      if (!payload.storeId) delete payload.storeId;
      if (!payload.categoryId) delete payload.categoryId;

      if (editing) {
        await axios.put<Banner>(`/delivery/banners/${editing._id}`, payload);
        setSuccess("تم تحديث البانر بنجاح");
      } else {
        await axios.post<Banner>(`/delivery/banners`, payload);
        setSuccess("تم إضافة البانر بنجاح");
      }

      setOpen(false);
      setEditing(null);
      resetForm();
      fetchBanners();
    } catch (error) {
      setError("فشل في حفظ البانر");
      console.error("❌ Failed to save banner", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      link: "",
      storeId: "",
      categoryId: "",
      order: 0,
      startDate: "",
      endDate: "",
      isActive: true,
      image: null,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا البانر؟")) {
      try {
        setLoading(true);
        await axios.delete(`/delivery/banners/${id}`);
        setSuccess("تم حذف البانر بنجاح");
        fetchBanners();
      } catch {
        setError("فشل في حذف البانر");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: arSA });
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const handleSnackbarClose = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* التنبيهات */}
      <SnackbarNotifactions
        error={error}
        success={success}
        onClose={handleSnackbarClose}
      />

      {/* شريط التحميل */}
      {loading && <LinearProgress />}

      {/* العنوان والأزرار */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          إدارة البانرات
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ minWidth: 150 }}
        >
          بانر جديد
        </Button>
      </Box>

      {/* جدول البانرات */}
      <Paper elevation={3} sx={{ overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "common.white" }}>الصورة</TableCell>
              <TableCell sx={{ color: "common.white" }}>العنوان</TableCell>
              <TableCell sx={{ color: "common.white" }}>الرابط</TableCell>
              <TableCell sx={{ color: "common.white" }}>الترتيب</TableCell>
              <TableCell sx={{ color: "common.white" }}>الفترة</TableCell>
              <TableCell sx={{ color: "common.white" }}>الحالة</TableCell>
              <TableCell align="right" sx={{ color: "common.white" }}>
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    لا توجد بانرات متاحة
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <StyledTableRow key={banner._id}>
                  <TableCell>
                    {banner.image && (
                      <Avatar
                        src={banner.image}
                        sx={{ width: 60, height: 60 }}
                        variant="rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {banner.title || "—"}
                    </Typography>
                    {banner.description && (
                      <Typography variant="body2" color="text.secondary">
                        {banner.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {banner.link ? (
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        href={banner.link}
                        target="_blank"
                        rel="noopener"
                      >
                        عرض الرابط
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{banner.order ?? 0}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {banner.startDate ? formatDate(banner.startDate) : "—"}
                        {" - "}
                        {banner.endDate ? formatDate(banner.endDate) : "—"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={banner.isActive ? "نشط" : "غير نشط"}
                      color={banner.isActive ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditing(banner);
                        setForm({
                          ...form,
                          ...banner,
                          startDate: banner.startDate?.split("T")[0] || "",
                          endDate: banner.endDate?.split("T")[0] || "",
                          image: null,
                        });
                        setOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(banner._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* نافذة الحوار */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "common.white" }}>
          {editing ? "تعديل البانر" : "إضافة بانر جديد"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            {/* معلومات البانر */}
            <Box sx={{ flex: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="عنوان البانر"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="وصف البانر"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  fullWidth
                  multiline
                  rows={3}
                />
                <TextField
                  label="رابط البانر"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  fullWidth
                  placeholder="https://example.com"
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    type="number"
                    label="ترتيب العرض"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      px: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      الحالة:
                    </Typography>
                    <Switch
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      color="primary"
                    />
                    <Typography
                      color={form.isActive ? "success.main" : "error.main"}
                    >
                      {form.isActive ? "نشط" : "غير نشط"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* الصورة والتواريخ */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* معاينة الصورة */}
                {(form.image || editing?.image) && (
                  <Card
                    elevation={0}
                    sx={{ border: 1, borderColor: "divider" }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={
                        form.image
                          ? URL.createObjectURL(form.image)
                          : editing?.image || ""
                      }
                      alt="معاينة البانر"
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        معاينة البانر
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* تحميل الصورة */}
                <Box
                  sx={{
                    mt: 2,
                    position: "relative",
                    width: "100%",
                    maxWidth: 300,
                  }}
                >
                  {/* نغلف الزر بعنصر <label> */}
                  <label
                    htmlFor="banner-image-upload"
                    style={{ display: "block", width: "100%" }}
                  >
                    <ImageUploadButton
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      disabled
                    >
                      {form.image ? form.image.name : "اختر صورة البانر"}
                    </ImageUploadButton>
                  </label>

                  {/* حقل الملف يكون منفصلاً لكنه مرتبط بالـ label عبر الـ id */}
                  <input
                    id="banner-image-upload"
                    type="file"
                    accept="image/*"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        image: e.target.files?.[0] || null,
                      })
                    }
                  />
                </Box>

                {/* التواريخ */}
                <TextField
                  type="date"
                  label="تاريخ البدء"
                  InputLabelProps={{ shrink: true }}
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  type="date"
                  label="تاريخ الانتهاء"
                  InputLabelProps={{ shrink: true }}
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  fullWidth
                />
              </Box>
            </Box>
          </Box>

          {/* المتاجر والفئات */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <TextField
              select
              label="المتجر المرتبط"
              value={form.storeId}
              onChange={(e) => setForm({ ...form, storeId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">لا يوجد متجر</MenuItem>
              {stores.map((store) => (
                <MenuItem key={store._id} value={store._id}>
                  {store.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="الفئة المرتبطة"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">لا يوجد فئة</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? "جاري الحفظ..." : editing ? "تحديث" : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// مكون مساعد للتنبيهات
function SnackbarNotifactions({
  error,
  success,
  onClose,
}: {
  error: string | null;
  success: string | null;
  onClose: () => void;
}) {
  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={onClose} sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={onClose} sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}
