// src/pages/admin/groceries/CatalogPage.tsx

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
} from "@mui/material";
import { useEffect, useState } from "react";
import { Edit, Delete } from "@mui/icons-material";
import * as merchantApi from "../../../api/merchant";

type Attribute = {
  _id: string;
  name: string;
  type: "number" | "select" | "text";
  unit?: string;
  options?: string[];
};

type Category = {
  _id: string;
  name: string;
};

type ProductAttribute = {
  attribute: string;
  value: string;
};

type ProductCatalog = {
  _id: string;
  name: string;
  description?: string;
  sellingUnits?: string[];
  image?: string;
  category: string; // 👈 هكذا
  usageType?: string; // <--- الجديد
  attributes?: ProductAttribute[];
};

export default function GroceriesCatalogPage() {
  const [products, setProducts] = useState<ProductCatalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [open, setOpen] = useState(false);
  const [newUnit, setNewUnit] = useState("");

  const [form, setForm] = useState<Partial<ProductCatalog>>({
    usageType: "grocery",
  }); // <--- الافتراضي مقاضي
  const [editId, setEditId] = useState<string | null>(null);

  // لجلب التصنيفات والسمات
  const fetchCategories = async () => {
    const data = await merchantApi.getCategories();
    setCategories(data);
  };
  const fetchAttributes = async (catId?: string) => {
    if (!catId) return setAttributes([]);
    const data = await merchantApi.getAttributesByCategory(catId);
    setAttributes(data);
  };
  const fetchProducts = async () => {
    // في حال دعم الAPI للفلترة
    const data = await merchantApi.getCatalogProducts('grocery');
    setProducts(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);
  useEffect(() => {
    if (form.category) {
      fetchAttributes(form.category);
      setForm((f) => ({ ...f, attributes: [] })); // أفرغ السمات عند تغيير التصنيف
    }
  }, [form.category, open]);

  // في حالة تغيير التصنيف، اجلب السمات الخاصة به

  const handleOpen = (prod?: ProductCatalog) => {
    if (prod) {
      setForm({ ...prod, usageType: prod.usageType || "grocery" });
      setEditId(prod._id);
    } else {
      setForm({ usageType: "grocery" }); // افتراضي مقاضي
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ usageType: "grocery" });
    setEditId(null);
  };

  const handleChange = (field: keyof ProductCatalog, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // التعامل مع السمات الديناميكية
  const handleAttrChange = (attribute: string, value: string) => {
    setForm((f) => {
      const attrs = f.attributes ? [...f.attributes] : [];
      const idx = attrs.findIndex((a) => a.attribute === attribute);
      if (idx !== -1) {
        attrs[idx].value = value;
      } else {
        attrs.push({ attribute, value });
      }
      return { ...f, attributes: attrs };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.image) {
      alert("كل الحقول إلزامية: الاسم، التصنيف، الصورة");
      return;
    }
    const submitData = { ...form, usageType: "grocery" }; // <-- إلزامي
    const selectedCat = categories.find((cat) => cat._id === form.category);
    if (!selectedCat) return alert("اختر تصنيفًا صالحًا!");
    // ممكن تتوسع وتتحقق من usageType أيضاً

    if (editId) {
      await merchantApi.updateCatalogProduct(editId, submitData);
    } else {
      await merchantApi.createCatalogProduct(submitData);
    }
    handleClose();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await merchantApi.updateCatalogProduct(id, { isActive: false });
      fetchProducts();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          المنتجات المركزية (كاتالوج المقاضي)
        </Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          إضافة منتج
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>الوصف</TableCell>
              <TableCell>الصورة</TableCell>
              <TableCell>التصنيف</TableCell>
              <TableCell>الوحدات</TableCell>

              {/* <TableCell>النوع</TableCell> اختياري لعرض usageType */}
              <TableCell>السمات</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod._id}>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.description}</TableCell>
                <TableCell>
                  {prod.image && (
                    <img
                      src={prod.image}
                      alt=""
                      width={48}
                      style={{ borderRadius: 8 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {typeof prod.category === "string"
                    ? categories.find((cat) => cat._id === prod.category)
                        ?.name || prod.category
                    : (prod.category as Category)?.name || "-"}
                </TableCell>

                {/* <TableCell>{prod.usageType || "-"}</TableCell>  */}
                <TableCell>
                  {prod.attributes &&
                    prod.attributes
                      .map((attr) => {
                        // attr.attribute قد يكون string أو object
                        const att =
                          typeof attr.attribute === "string"
                            ? attributes.find((a) => a._id === attr.attribute)
                            : attr.attribute;
                        return att ? `${att.name}: ${attr.value}` : attr.value;
                      })
                      .join(" | ")}
                </TableCell>
                <TableCell>
                  {prod.sellingUnits && prod.sellingUnits.length
                    ? prod.sellingUnits.join("، ")
                    : "-"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(prod)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(prod._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog لإضافة/تعديل المنتج */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "تعديل منتج" : "إضافة منتج"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="الاسم"
            value={form.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            label="الوصف"
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <TextField
            label="رابط الصورة"
            value={form.image || ""}
            onChange={(e) => handleChange("image", e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>التصنيف</InputLabel>
            <Select
              value={form.category || ""}
              label="التصنيف"
              onChange={(e) => handleChange("category", e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>وحدات البيع (اختر أو أضف)</InputLabel>
            <Select
              multiple
              value={form.sellingUnits || []}
              label="وحدات البيع"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sellingUnits: Array.isArray(e.target.value)
                    ? e.target.value
                    : [e.target.value],
                }))
              }
              renderValue={(selected) => (selected as string[]).join("، ")}
            >
              {/* وحدات افتراضية مقترحة (تقدر تعدلها أو تضيف من الداتا) */}
              <MenuItem value="كجم">كجم</MenuItem>
              <MenuItem value="حبة">حبة</MenuItem>
              <MenuItem value="صندوق">صندوق</MenuItem>
              <MenuItem value="بكج">بكج</MenuItem>
              <MenuItem value="ربطة">ربطة</MenuItem>
              {/* يمكن السماح بكتابة وحدة جديدة عبر TextField منفصل إذا أردت */}
            </Select>
          </FormControl>
          {/* بعد الـSelect الخاص بوحدات البيع */}
          <TextField
            label="إضافة وحدة جديدة"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newUnit) {
                setForm((f) => ({
                  ...f,
                  sellingUnits: [...(f.sellingUnits || []), newUnit],
                }));
                setNewUnit("");
              }
            }}
          />

          {/* السمات حسب التصنيف */}
          {attributes.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography fontWeight="bold" mt={2}>
                السمات:
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
                        form.attributes?.find((a) => a.attribute === attr._id)
                          ?.value || ""
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
                        form.attributes?.find((a) => a.attribute === attr._id)
                          ?.value || ""
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
