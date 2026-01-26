// src/pages/DeliveryPromotionsPage.tsx
import { useEffect, useState, type ChangeEvent } from "react";
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
  Card,
  CardMedia,
  LinearProgress,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "../../utils/axios";
import { auth } from "../../config/firebaseConfig";
import type {
  IPromotionPopulated,
  PromotionForm,
  PromotionPayload,
  DeliveryStore,
  Category,
  Product,
  PromotionPlacement,
} from "../../type/delivery";
// ✅ تأكد أن اسم الملف/الدالة صحيحان. إن كانت دالتك ما زالت Cloudinary فعدّل السطر التالي
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";
import ImageUploader from "./components/ImageUploader";
import { uploadFileToBunny } from "../../services/uploadFileToCloudinary";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
  "&:hover": { backgroundColor: theme.palette.action.selected },
}));

const StatusChip = styled(Chip)({
  fontWeight: "bold",
  minWidth: 80,
});

const PLACEMENTS = [
  { value: "home_hero", label: "سلايدر الرئيسية" },
  { value: "home_strip", label: "شريط رئيسية" },
  { value: "category_header", label: "رأس صفحة الفئة" },
  { value: "category_feed", label: "داخل صفحة الفئة" },
  { value: "store_header", label: "رأس صفحة المتجر" },
  { value: "search_banner", label: "صفحة البحث" },
  { value: "cart", label: "السلة" },
  { value: "checkout", label: "الدفع" },
] as const;

const toDateInput = (v?: string | Date) => (v ? new Date(v).toISOString().slice(0, 10) : "");
const toISOStart = (d?: string) => (d ? new Date(d + "T00:00:00.000Z").toISOString() : undefined);
const toISOEnd = (d?: string) => (d ? new Date(d + "T23:59:59.999Z").toISOString() : undefined);

const INITIAL_FORM: PromotionForm = {
  title: "",
  description: "",
  image: null,
  link: "",
  target: "product",
  value: 0,
  valueType: "percentage",
  productId: "",
  storeId: "",
  categoryId: "",
  placements: ["home_hero"],
  channels: ["app"],
  citiesText: "",
  stacking: "best",
  minQty: undefined,
  minOrderSubtotal: undefined,
  maxDiscountAmount: undefined,
  startDate: "",
  endDate: "",
  isActive: true,
  order: 0,
};

// Type guards for populated objects
const isPopulatedProduct = (obj: unknown): obj is Product =>
  obj !== null && typeof obj === 'object' && '_id' in obj && 'name' in obj;
const isPopulatedStore = (obj: unknown): obj is DeliveryStore =>
  obj !== null && typeof obj === 'object' && '_id' in obj && 'name' in obj;
const isPopulatedCategory = (obj: unknown): obj is Category =>
  obj !== null && typeof obj === 'object' && '_id' in obj && 'name' in obj;

export default function DeliveryPromotionsPage() {
  const [promos, setPromos] = useState<IPromotionPopulated[]>([]);
  const [stores, setStores] = useState<DeliveryStore[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IPromotionPopulated | null>(null);
  const [form, setForm] = useState<PromotionForm>({ ...INITIAL_FORM });

  // Fetch lists
  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // ⚠️ ملاحظة: GET /delivery/promotions في السيرفر لديك لا يطبّق verifyFirebase
      // لذا لن يُعتبر المستخدم Admin وقد ترى العروض النشطة فقط.
      // الحل الأفضل: وفّر Endpoint إداري محمي، أو فعّل verifyFirebase على نفس الراوت.
      const [pRes, sRes, cRes, prRes] = await Promise.all([
        axios.get<IPromotionPopulated[]>("/promotions", { headers }),
        axios.get<DeliveryStore[]>("/delivery/stores", { headers }),
        axios.get<Category[]>("/delivery/categories", { headers }),
        axios.get<Product[]>("/delivery/products", { headers }),
      ]);
      setPromos(pRes.data);
      setStores(sRes.data);
      setCategories(cRes.data);
      setProducts(prRes.data);
    } catch (err) {
      setError("فشل في تحميل البيانات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const toArray = <T extends string>(v: unknown): T[] =>
    Array.isArray(v) ? (v as T[]) : typeof v === "string" ? (v.split(",") as T[]) : [];
  useEffect(() => {
    fetchAll();
  }, []);

  // Save or update
  const handleSave = async () => {
    setLoading(true);
    try {
      // تحقق هدف العرض
      if (form.target === "product" && !form.productId) throw new Error("اختر المنتج");
      if (form.target === "store" && !form.storeId) throw new Error("اختر المتجر");
      if (form.target === "category" && !form.categoryId) throw new Error("اختر الفئة");

      const imgUrl = form.image ? await uploadFileToBunny(form.image) : editing?.image || "";

      const payload: PromotionPayload = {
        title: form.title || undefined,
        description: form.description || undefined,
        image: imgUrl || undefined,
        link: form.link || undefined,
        target: form.target,
        value: form.value || undefined,
        valueType: form.valueType,
        product: form.target === "product" ? form.productId || undefined : undefined,
        store: form.target === "store" ? form.storeId || undefined : undefined,
        category: form.target === "category" ? form.categoryId || undefined : undefined,
        placements: form.placements?.length ? form.placements : ["home_hero"],
        channels: form.channels?.length ? form.channels : ["app"],
        cities: form.citiesText.trim()
          ? form.citiesText.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        stacking: form.stacking,
        minQty: form.minQty || undefined,
        minOrderSubtotal: form.minOrderSubtotal || undefined,
        maxDiscountAmount: form.maxDiscountAmount || undefined,
        order: form.order || 0,
        startDate: toISOStart(form.startDate),
        endDate: toISOEnd(form.endDate),
        isActive: form.isActive,
      };

      const token = await auth.currentUser?.getIdToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (editing) {
        await axios.patch(`/promotions/${editing._id}`, payload, { headers });
        setSuccess("تم تحديث العرض بنجاح");
      } else {
        await axios.post("/promotions", payload, { headers });
        setSuccess("تم إضافة العرض بنجاح");
      }

      setOpen(false);
      setEditing(null);
      setForm({ ...INITIAL_FORM });
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل في حفظ العرض");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/promotions/${id}`, { headers });
      setSuccess("تم حذف العرض");
      fetchAll();
    } catch (err) {
      setError("فشل في حذف العرض");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (s?: string | Date) => (s ? format(parseISO(s.toString()), "dd/MM/yyyy", { locale: arSA }) : "—");

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setError(null);
    setSuccess(null);
  };

  const openForCreate = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* إشعارات */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={closeDialog}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={closeDialog}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      {loading && <LinearProgress />}

      {/* هيدر الصفحة */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" color="primary">
          إدارة العروض
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openForCreate}>
          عرض جديد
        </Button>
      </Box>

      {/* الجدول */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "common.white" }}>صورة</TableCell>
              <TableCell sx={{ color: "common.white" }}>العنوان</TableCell>
              <TableCell sx={{ color: "common.white" }}>الرابط</TableCell>
              <TableCell sx={{ color: "common.white" }}>القيمة</TableCell>
              <TableCell sx={{ color: "common.white" }}>الهدف</TableCell>
              <TableCell sx={{ color: "common.white" }}>أماكن الظهور</TableCell>
              <TableCell sx={{ color: "common.white" }}>الفترة</TableCell>
              <TableCell sx={{ color: "common.white" }}>الحالة</TableCell>
              <TableCell align="right" sx={{ color: "common.white" }}>
                إجراءات
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {promos.map((p) => (
              <StyledTableRow key={p._id}>
                <TableCell>{p.image && <CardMedia component="img" height="60" image={p.image} />}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>
                  <LinkIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> {p.link || "—"}
                </TableCell>
                <TableCell>
                  {p.valueType === "percentage" ? `${p.value}%` : `${p.value} ﷼`}
                </TableCell>
                <TableCell>
                  {p.target === "product" && isPopulatedProduct(p.product)
                    ? `منتج: ${p.product.name}`
                    : p.target === "store" && isPopulatedStore(p.store)
                    ? `متجر: ${p.store.name}`
                    : p.target === "category" && isPopulatedCategory(p.category)
                    ? `فئة: ${p.category.name}`
                    : p.target}
                </TableCell>
                <TableCell>
                  {p.placements?.length ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {p.placements.map((pl: string) => (
                        <Chip key={pl} label={PLACEMENTS.find((x) => x.value === pl)?.label || pl} size="small" />
                      ))}
                    </Box>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(p.startDate)} — {formatDate(p.endDate)}
                </TableCell>
                <TableCell>
                  <StatusChip label={p.isActive ? "نشط" : "غير نشط"} color={p.isActive ? "success" : "error"} />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setEditing(p);
                      setForm({
                        title: p.title || "",
                        description: p.description || "",
                        image: null,
                        link: p.link || "",
                        target: p.target,
                        value: p.value || 0,
                        valueType: p.valueType || "percentage",
                        productId: isPopulatedProduct(p.product) ? p.product._id : "",
                        storeId: isPopulatedStore(p.store) ? p.store._id : "",
                        categoryId: isPopulatedCategory(p.category) ? p.category._id : "",
                        placements: p.placements?.length ? p.placements : ["home_hero"],
                        channels: p.channels?.length ? p.channels : ["app"],
                        citiesText: (p.cities || []).join(", "),
                        stacking: p.stacking || "best",
                        minQty: p.minQty,
                        minOrderSubtotal: p.minOrderSubtotal,
                        maxDiscountAmount: p.maxDiscountAmount,
                        startDate: toDateInput(p.startDate),
                        endDate: toDateInput(p.endDate),
                        isActive: p.isActive,
                        order: p.order || 0,
                      });
                      setOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* حوار إضافة/تعديل */}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: "primary.main", color: "common.white" }}>
          {editing ? "تعديل العرض" : "إضافة عرض جديد"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {/* الحقول الأساسية */}
            <Box sx={{ flex: 2, display: "grid", gap: 2 }}>
              <TextField
                label="عنوان العرض"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <TextField
                label="الوصف"
                multiline
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <TextField
                label="رابط (اختياري)"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />

              <TextField
                select
                label="الهدف"
                value={form.target}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({
                    ...form,
                    target: e.target.value as "product" | "store" | "category",
                  })
                }
              >
                <MenuItem value="product">منتج</MenuItem>
                <MenuItem value="store">متجر</MenuItem>
                <MenuItem value="category">فئة</MenuItem>
              </TextField>

              {/* اختيارات بناءً على الهدف */}
              {form.target === "product" && (
                <TextField
                  select
                  label="منتج"
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                >
                  {products.map((x) => (
                    <MenuItem key={x._id} value={x._id}>
                      {x.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {form.target === "store" && (
                <TextField
                  select
                  label="متجر"
                  value={form.storeId}
                  onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                >
                  {stores.map((x) => (
                    <MenuItem key={x._id} value={x._id}>
                      {x.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {form.target === "category" && (
                <TextField
                  select
                  label="فئة"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  {categories.map((x) => (
                    <MenuItem key={x._id} value={x._id}>
                      {x.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                type="number"
                label="القيمة"
                value={form.value}
                inputProps={{ min: 0 }}
                helperText={form.valueType === "percentage" ? "% من السعر الأصلي" : "بالريال"}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
              <TextField
                select
                label="نوع القيمة"
                value={form.valueType}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, valueType: e.target.value as "percentage" | "fixed" })
                }
              >
                <MenuItem value="percentage">نسبة مئوية</MenuItem>
                <MenuItem value="fixed">مبلغ ثابت</MenuItem>
              </TextField>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>نشط:</Typography>
                <Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              </Box>

              <TextField
                type="date"
                label="تاريخ البداية"
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <TextField
                type="date"
                label="تاريخ الانتهاء"
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />

<TextField
  select
  label="أماكن الظهور (placements)"
  SelectProps={{ multiple: true }}
  value={form.placements}
  onChange={(e) =>
    setForm({
      ...form,
      placements: toArray<PromotionPlacement>(e.target.value),
    })
  }
>
  {PLACEMENTS.map((p) => (
    <MenuItem key={p.value} value={p.value}>
      {p.label}
    </MenuItem>
  ))}
</TextField>

<TextField
  select
  label="القنوات"
  SelectProps={{ multiple: true }}
  value={form.channels}
  onChange={(e) =>
    setForm({
      ...form,
      channels: toArray<"app" | "web">(e.target.value),
    })
  }
>
                <MenuItem value="app">تطبيق</MenuItem>
                <MenuItem value="web">ويب</MenuItem>
              </TextField>

              <TextField
                label="المدن (افصل بفاصلة ,)"
                placeholder="Sana'a, Aden"
                value={form.citiesText}
                onChange={(e) => setForm({ ...form, citiesText: e.target.value })}
              />

              <TextField
                select
                label="سياسة التراكم (stacking)"
                value={form.stacking}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, stacking: e.target.value as "best" | "none" | "stack_same_target" })}
              >
                <MenuItem value="best">أفضل خصم فقط</MenuItem>
                <MenuItem value="none">بدون تراكم/اختيار محدد لاحقًا</MenuItem>
                <MenuItem value="stack_same_target">تراكم لنفس الهدف</MenuItem>
              </TextField>

              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { sm: "1fr 1fr 1fr", xs: "1fr" } }}>
                <TextField
                  type="number"
                  label="حد أدنى للكمية (اختياري)"
                  value={form.minQty ?? ""}
                  onChange={(e) => setForm({ ...form, minQty: e.target.value ? Number(e.target.value) : undefined })}
                />
                <TextField
                  type="number"
                  label="حد أدنى لقيمة الطلب (اختياري)"
                  value={form.minOrderSubtotal ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, minOrderSubtotal: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
                <TextField
                  type="number"
                  label="سقف مبلغ الخصم (اختياري)"
                  value={form.maxDiscountAmount ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </Box>

              <TextField
                type="number"
                label="ترتيب الظهور (order)"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </Box>

            {/* رفع الصورة */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <ImageUploader label="صورة العرض" file={form.image} onChange={(file) => setForm({ ...form, image: file })} />
              {editing?.image && !form.image && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" mb={1}>
                    الصورة الحالية:
                  </Typography>
                  <Card>
                    <CardMedia component="img" height="140" image={editing.image} alt="الصورة الحالية" />
                  </Card>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} variant="outlined">
            إلغاء
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {editing ? "تحديث" : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
