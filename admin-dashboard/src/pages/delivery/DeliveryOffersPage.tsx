import  { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Switch,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  LinearProgress,
  styled,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
  Percent,
  AttachMoney,
} from "@mui/icons-material";
import axios from "../../utils/axios";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";

// TypeScript interfaces
type OfferType = "product" | "store" | "category";
interface Offer {
  _id: string;
  title: string;
  type: OfferType;
  value: number;
  valueType: "percentage" | "fixed";
  product?: { _id: string; name: string; image?: string };
  store?: { _id: string; name: string };
  category?: { _id: string; name: string };
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

interface OfferForm {
  title: string;
  type: OfferType;
  value: number;
  valueType: "percentage" | "fixed";
  productId: string;
  storeId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  image?: string;
}
interface Store {
  _id: string;
  name: string;
}
interface Category {
  _id: string;
  name: string;
}

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StatusChip = styled(Chip)({
  fontWeight: "bold",
  minWidth: 80,
});

const OfferTypeChip = styled(Chip)({
  fontWeight: "bold",
  textTransform: "capitalize",
});

export default function DeliveryOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<OfferForm>({
    title: "",
    type: "product",
    value: 0,
    valueType: "percentage",
    productId: "",
    storeId: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [editing, setEditing] = useState<Offer | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [offersRes, productsRes, storesRes, categoriesRes] =
        await Promise.all([
          axios.get<Offer[]>("/delivery/offer"),
          axios.get<Product[]>("/delivery/products"),
          axios.get<Store[]>("/delivery/stores"),
          axios.get<Category[]>("/delivery/categories"),
        ]);
      setOffers(offersRes.data);
      setProducts(productsRes.data);
      setStores(storesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError("فشل في جلب البيانات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: arSA });
  };

  // Reset form
  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      type: "product",
      value: 0,
      valueType: "percentage",
      productId: "",
      storeId: "",
      categoryId: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
  };

  // Save or update offer
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build payload
      const payload: Partial<Offer> = { ...form };

      // Clear irrelevant IDs based on type
      if (form.type === "product") {
        delete payload.store;
        delete payload.category;
      } else if (form.type === "store") {
        delete payload.product;
        delete payload.category;
      } else {
        delete payload.product;
        delete payload.store;
      }

      if (editing) {
        await axios.put<Offer>(`/delivery/offer/${editing._id}`, payload);
        setSuccess("تم تحديث العرض بنجاح");
      } else {
        await axios.post<Offer>("/delivery/offer", payload);
        setSuccess("تم إضافة العرض بنجاح");
      }

      fetchData();
      setOpen(false);
      resetForm();
    } catch (err) {
      setError("فشل في حفظ العرض");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete offer
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/delivery/offer/${id}`);
      setSuccess("تم حذف العرض بنجاح");
      fetchData();
    } catch (err) {
      setError("فشل في حذف العرض");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSnackbarClose = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleSnackbarClose}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          {success}
        </Alert>
      </Snackbar>

      {/* Loading indicator */}
      {loading && <LinearProgress />}

      {/* Header */}
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
          إدارة العروض
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          sx={{ minWidth: 150 }}
        >
          عرض جديد
        </Button>
      </Box>

      {/* Offers table */}
      <Paper elevation={3} sx={{ overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "common.white" }}>العنوان</TableCell>
              <TableCell sx={{ color: "common.white" }}>النوع</TableCell>
              <TableCell sx={{ color: "common.white" }}>القيمة</TableCell>
              <TableCell sx={{ color: "common.white" }}>الفترة</TableCell>
              <TableCell sx={{ color: "common.white" }}>الحالة</TableCell>
              <TableCell align="right" sx={{ color: "common.white" }}>
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    لا توجد عروض متاحة
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => (
                <StyledTableRow key={offer._id}>
                  <TableCell>
                    <Typography fontWeight="medium">{offer.title}</Typography>
                    {offer.product?.image && (
                      <Avatar
                        src={offer.product.image}
                        sx={{ width: 40, height: 40, mt: 1 }}
                        variant="rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <OfferTypeChip
                      label={
                        offer.type === "product"
                          ? "منتج"
                          : offer.type === "store"
                          ? "متجر"
                          : "قسم"
                      }
                      color="primary"
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {offer.type === "product"
                        ? offer.product?.name
                        : offer.type === "store"
                        ? offer.store?.name
                        : offer.category?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {offer.valueType === "percentage" ? (
                        <Percent />
                      ) : (
                        <AttachMoney />
                      )}
                      <Typography>
                        {offer.value}
                        {offer.valueType === "percentage" ? "%" : " ﷼"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(offer.startDate)} -{" "}
                        {formatDate(offer.endDate)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={offer.isActive ? "نشط" : "غير نشط"}
                      color={offer.isActive ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditing(offer);
                        setForm({
                          title: offer.title,
                          type: offer.type,
                          value: offer.value,
                          valueType: offer.valueType,
                          productId: offer.product?._id || "",
                          storeId: offer.store?._id || "",
                          categoryId: offer.category?._id || "",
                          startDate: offer.startDate?.split("T")[0] || "",
                          endDate: offer.endDate?.split("T")[0] || "",
                          isActive: offer.isActive,
                        });
                        setOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(offer._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Offer Dialog */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "common.white" }}>
          {editing ? "تعديل العرض" : "إضافة عرض جديد"}
        </DialogTitle>
        <DialogContent
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="عنوان العرض"
            fullWidth
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />

          <TextField
            select
            label="نوع العرض"
            value={form.type}
            onChange={(e) => {
              const newType = e.target.value as OfferType;
              setForm((prev) => ({
                ...prev,
                type: newType,
                productId: newType === "product" ? prev.productId : "",
                storeId: newType === "store" ? prev.storeId : "",
                categoryId: newType === "category" ? prev.categoryId : "",
              }));
            }}
            fullWidth
          >
            <MenuItem value="product">منتج</MenuItem>
            <MenuItem value="store">متجر</MenuItem>
            <MenuItem value="category">قسم</MenuItem>
          </TextField>

          {form.type === "product" && (
            <TextField
              select
              label="المنتج"
              value={form.productId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, productId: e.target.value }))
              }
              fullWidth
            >
              <MenuItem value="">اختر منتجاً</MenuItem>
              {products.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {p.image && (
                      <Avatar src={p.image} sx={{ width: 24, height: 24 }} />
                    )}
                    {p.name}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          )}

          {form.type === "store" && (
            <TextField
              select
              label="المتجر"
              value={form.storeId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, storeId: e.target.value }))
              }
              fullWidth
            >
              <MenuItem value="">اختر متجراً</MenuItem>
              {stores.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {form.type === "category" && (
            <TextField
              select
              label="القسم"
              value={form.categoryId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              fullWidth
            >
              <MenuItem value="">اختر قسماً</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="قيمة العرض"
              type="number"
              fullWidth
              value={form.value}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, value: Number(e.target.value) }))
              }
              inputProps={{ min: 0 }}
            />
            <TextField
              select
              label="نوع القيمة"
              value={form.valueType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  valueType: e.target.value as OfferForm["valueType"],
                }))
              }
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="percentage">نسبة مئوية</MenuItem>
              <MenuItem value="fixed">قيمة ثابتة</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              type="date"
              label="تاريخ البداية"
              InputLabelProps={{ shrink: true }}
              value={form.startDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startDate: e.target.value }))
              }
              fullWidth
            />
            <TextField
              type="date"
              label="تاريخ النهاية"
              InputLabelProps={{ shrink: true }}
              value={form.endDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endDate: e.target.value }))
              }
              fullWidth
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
              mt: 1,
            }}
          >
            <Typography variant="body1">الحالة:</Typography>
            <Switch
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              color="primary"
            />
            <Typography color={form.isActive ? "success.main" : "error.main"}>
              {form.isActive ? "نشط" : "غير نشط"}
            </Typography>
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
