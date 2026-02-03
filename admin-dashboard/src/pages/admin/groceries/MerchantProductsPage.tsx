// src/pages/admin/groceries/MerchantProductsPage.tsx

import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Edit, Delete } from "@mui/icons-material";
import axios from "../../../utils/axios";
// JWT from localStorage
import * as merchantApi from "../../../api/merchant";

type Category = { _id: string; name: string };
type ProductCatalog = {
  _id: string;
  name: string;
  category: string | { _id: string; name: string };
  sellingUnits?: string[];
};
type Store = { _id: string; name: string };
type Attribute = {
  _id: string;
  name: string;
  type: "number" | "select" | "text";
  unit?: string;
  options?: string[];
};

type MerchantProduct = {
  _id: string;
  merchant: Vendor;
  store: Store; // <<<<< الجديد
  product: ProductCatalog;
  price: number;
  stock?: number;
  isAvailable: boolean;
  origin?: "catalog" | "merchant" | "imported"; // مصدر المنتج
  customImage?: string;
  customDescription?: string;
  customAttributes?: { attribute: string; value: string }[];
  sellingUnit?: string;
};
interface Vendor {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  store: { _id: string; name: string };
  isActive: boolean;
  salesCount: number;
  totalRevenue: number;
}
type MerchantProductForm = {
  merchant?: string;
  store?: string; // <<<<< الجديد
  product?: string;
  price?: number;
  stock?: number;
  isAvailable?: boolean;
  origin?: "catalog" | "merchant" | "imported"; // مصدر المنتج
  customImage?: string;
  customDescription?: string;
  customAttributes?: { attribute: string; value: string }[];
  sellingUnit?: string;
};

export default function GroceriesMerchantProductsPage() {
  const [merchantProducts, setMerchantProducts] = useState<MerchantProduct[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  console.log(categories);
  const [products, setProducts] = useState<ProductCatalog[]>([]);
  const [merchants, setMerchants] = useState<Vendor[]>([]);
  const [stores, setStores] = useState<Store[]>([]); // <<<<< الجديد
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MerchantProductForm>({});
  const [editId, setEditId] = useState<string | null>(null);

  // فلاتر
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [allMerchantProducts, setAllMerchantProducts] = useState<MerchantProduct[]>([]);

  // جلب البيانات الأساسية
  const fetchAll = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const [mpRes, catsRes, prodsRes, merchRes, storesRes] = await Promise.all([
      merchantApi.getMerchantProducts(),
      merchantApi.getCategories(),
      merchantApi.getCatalogProducts('grocery'),
      axios.get<{ data?: Vendor[] } | Vendor[]>("/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get<{ data?: Store[] } | Store[]>("/delivery/stores"),
    ]);

    const merchData = merchRes.data;
    const merchantsList = Array.isArray(merchData)
      ? merchData
      : Array.isArray((merchData as { data?: Vendor[] })?.data)
        ? (merchData as { data: Vendor[] }).data
        : [];

    const storesData = storesRes.data;
    const storesList = Array.isArray(storesData)
      ? storesData
      : Array.isArray((storesData as { data?: Store[] })?.data)
        ? (storesData as { data: Store[] }).data
        : [];

    setAllMerchantProducts(Array.isArray(mpRes) ? mpRes : []);
    setCategories(Array.isArray(catsRes) ? catsRes : []);
    setProducts(Array.isArray(prodsRes) ? prodsRes : []);
    setMerchants(merchantsList);
    setStores(storesList);
  };

  console.log("stores in dialog", stores);

  // جلب سمات المنتج عند اختيار المنتج من الكاتالوج
  const fetchProductAttributes = async (productId?: string) => {
    if (!productId) {
      setAttributes([]);
      return;
    }
    const prod = products.find((p) => p._id === productId);
    if (!prod) {
      setAttributes([]);
      return;
    }
    // هنا التحقق
    const categoryId =
      typeof prod.category === "string" ? prod.category : prod.category?._id; // إذا كان object خذ _id

    if (!categoryId) {
      setAttributes([]);
      return;
    }

    const data = await merchantApi.getAttributesByCategory(categoryId);
    setAttributes(Array.isArray(data) ? (data as Attribute[]) : []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (form.product) fetchProductAttributes(form.product);
  }, );

  // فلترة البيانات حسب المصدر
  useEffect(() => {
    if (originFilter === "all") {
      setMerchantProducts(allMerchantProducts);
    } else {
      const filtered = allMerchantProducts.filter(mp => mp.origin === originFilter);
      setMerchantProducts(filtered);
    }
  }, [originFilter, allMerchantProducts]);

  const handleOpen = (mp?: MerchantProduct) => {
    if (mp) {
      setForm({
        merchant: mp.merchant._id,
        store: mp.store?._id, // <<<<< الجديد
        product: mp.product._id,
        price: mp.price,
        stock: mp.stock,
        isAvailable: mp.isAvailable,
        customImage: mp.customImage,
        customDescription: mp.customDescription,
        customAttributes: mp.customAttributes,
      });
      setEditId(mp._id);
    } else {
      setForm({});
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({});
    setEditId(null);
    setAttributes([]);
  };

  const handleChange = (
    field: keyof MerchantProductForm,
    value: string | number | boolean
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleAttrChange = (attribute: string, value: string) => {
    setForm((f) => {
      const attrs = f.customAttributes ? [...f.customAttributes] : [];
      const idx = attrs.findIndex((a) => a.attribute === attribute);
      if (idx !== -1) {
        attrs[idx].value = value;
      } else {
        attrs.push({ attribute, value });
      }
      return { ...f, customAttributes: attrs };
    });
  };

  const handleSave = async () => {
    if (!form.merchant || !form.store || !form.product || !form.price) {
      alert("الحقول الأساسية مطلوبة: التاجر، المتجر، المنتج، السعر");
      return;
    }
    if (form.price !== undefined && form.price <= 0) {
      alert("يجب أن يكون السعر رقمًا موجبًا");
      return;
    }

    if (form.sellingUnit === undefined || form.sellingUnit === "") {
      // تحقق إضافي في حال المنتج له وحدات بيع محددة
      const prod = products.find((p) => p._id === form.product);
      if (prod?.sellingUnits?.length) {
        alert("اختر وحدة البيع");
        return;
      }
    }
    const submitData: MerchantProductForm = { ...form };
    if (editId) {
      await merchantApi.updateMerchantProduct(editId, submitData);
    } else {
      await merchantApi.createMerchantProduct(submitData);
    }
    handleClose();
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await merchantApi.deleteMerchantProduct(id);
      fetchAll();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة منتجات التجار
        </Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          إضافة منتج تاجر
        </Button>
      </Box>

      {/* فلتر المصدر */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>المصدر</InputLabel>
          <Select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            label="المصدر"
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="catalog">كتالوج</MenuItem>
            <MenuItem value="merchant">تاجر</MenuItem>
            <MenuItem value="imported">مستورد</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المصدر</TableCell>
              <TableCell>اسم التاجر</TableCell>
              <TableCell>المتجر</TableCell>
              <TableCell>المنتج</TableCell>
              <TableCell>السعر</TableCell>
              <TableCell>الكمية</TableCell>
              <TableCell>التوفر</TableCell>
              <TableCell>وحدة البيع</TableCell>

              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merchantProducts.map((mp) => (
              <TableRow key={mp._id}>
                <TableCell>
                  <Chip
                    label={mp.origin === "catalog" ? "كتالوج" : mp.origin === "merchant" ? "تاجر" : "مستورد"}
                    size="small"
                    color={mp.origin === "catalog" ? "primary" : mp.origin === "merchant" ? "success" : "warning"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{mp.merchant?.fullName || "-"}</TableCell>
                <TableCell>{mp.store?.name || "-"}</TableCell>

                <TableCell>{mp.product?.name || "-"}</TableCell>
                <TableCell>{mp.price}</TableCell>
                <TableCell>{mp.stock ?? "-"}</TableCell>
                <TableCell>{mp.isAvailable ? "متوفر" : "غير متوفر"}</TableCell>
                <TableCell>{mp.sellingUnit || "-"}</TableCell>

                <TableCell>
                  <IconButton onClick={() => handleOpen(mp)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(mp._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog لإضافة/تعديل منتج تاجر */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editId ? "تعديل منتج تاجر" : "إضافة منتج تاجر"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <FormControl fullWidth>
            <InputLabel>التاجر</InputLabel>
            <Select
              value={form.merchant || ""}
              label="التاجر"
              onChange={(e) => handleChange("merchant", e.target.value)}
            >
              {(Array.isArray(merchants) ? merchants : []).map((m) => (
                <MenuItem key={m._id} value={m._id}>
                  {m.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>المتجر</InputLabel>
            <Select
              value={form.store || ""}
              label="المتجر"
              onChange={(e) => handleChange("store", e.target.value)}
            >
              {(Array.isArray(stores) ? stores : []).map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>المنتج</InputLabel>
            <Select
              value={form.product || ""}
              label="المنتج"
              onChange={(e) => handleChange("product", e.target.value)}
            >
              {products.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* وحدات البيع حسب المنتج */}
          {form.product &&
            (() => {
              const selectedProduct = products.find(
                (p) => p._id === form.product
              );
              const units: string[] = selectedProduct?.sellingUnits ?? [];
              return units.length > 0 ? (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>وحدة البيع</InputLabel>
                  <Select
                    value={form.sellingUnit || ""}
                    label="وحدة البيع"
                    onChange={(e) =>
                      handleChange("sellingUnit", e.target.value)
                    }
                  >
                    {units.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null;
            })()}

          <FormControl fullWidth>
            <InputLabel>المصدر</InputLabel>
            <Select
              value={form.origin || "catalog"}
              label="المصدر"
              onChange={(e) => handleChange("origin", e.target.value)}
            >
              <MenuItem value="catalog">كتالوج</MenuItem>
              <MenuItem value="merchant">تاجر</MenuItem>
              <MenuItem value="imported">مستورد</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={form.sellingUnit ? `السعر لـ ${form.sellingUnit}` : "السعر"}
            type="number"
            value={form.price ?? ""}
            onChange={(e) => handleChange("price", Number(e.target.value))}
          />

          <TextField
            label="الكمية"
            type="number"
            value={form.stock ?? ""}
            onChange={(e) => handleChange("stock", Number(e.target.value))}
          />
          <FormControl fullWidth>
            <InputLabel>التوفر</InputLabel>
            <Select
              value={
                form.isAvailable === undefined
                  ? ""
                  : form.isAvailable
                  ? "1"
                  : "0"
              }
              label="التوفر"
              onChange={(e) =>
                handleChange("isAvailable", e.target.value === "1")
              }
            >
              <MenuItem value="1">متوفر</MenuItem>
              <MenuItem value="0">غير متوفر</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="صورة مخصصة (رابط)"
            value={form.customImage ?? ""}
            onChange={(e) => handleChange("customImage", e.target.value)}
          />
          <TextField
            label="وصف مخصص"
            value={form.customDescription ?? ""}
            onChange={(e) => handleChange("customDescription", e.target.value)}
            multiline
            rows={2}
          />
          {/* السمات الخاصة بالمنتج */}
          {attributes.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography fontWeight="bold" mt={2}>
                سمات إضافية:
              </Typography>
              {attributes.map((attr) => (
                <Box
                  key={attr._id}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <Typography sx={{ minWidth: 110 }}>{attr.name}:</Typography>
                  {attr.type === "select" ? (
                    <Select
                      value={
                        form.customAttributes?.find(
                          (a) => a.attribute === attr._id
                        )?.value || ""
                      }
                      size="small"
                      onChange={(e) =>
                        handleAttrChange(attr._id, e.target.value)
                      }
                    >
                      {attr.options?.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <TextField
                      size="small"
                      value={
                        form.customAttributes?.find(
                          (a) => a.attribute === attr._id
                        )?.value || ""
                      }
                      onChange={(e) =>
                        handleAttrChange(attr._id, e.target.value)
                      }
                      type={attr.type === "number" ? "number" : "text"}
                      placeholder={attr.unit}
                    />
                  )}
                  {attr.unit && (
                    <Typography color="text.secondary">{attr.unit}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
