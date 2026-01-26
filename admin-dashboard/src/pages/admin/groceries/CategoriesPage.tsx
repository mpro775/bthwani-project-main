// src/pages/admin/groceries/CategoriesPage.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Edit, Delete } from "@mui/icons-material";
import * as merchantApi from "../../../api/merchant";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  usageType?: string; // ← أضف هذا

  parent?: string | null;
};
const USAGE_TYPES = [
  { value: "grocery", label: "مقاضي" },
  { value: "restaurant", label: "مطاعم" },
  { value: "retail", label: "تجزئة" },
];
export default function GroceriesCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Category>>({});
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const data = await merchantApi.getCategories();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (cat?: Category) => {
    if (cat) {
      setForm(cat);
      setEditId(cat._id);
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
  };

  const handleChange = (field: keyof Category, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      alert("الاسم والمعرف (slug) مطلوبان");
      return;
    }
    const submitData = { ...form, usageType: "grocery" };
    if (editId) {
      await merchantApi.updateCategory(editId, submitData);
    } else {
      await merchantApi.createCategory(submitData);
    }
    handleClose();
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await merchantApi.deleteCategory(id);
      fetchCategories();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة تصنيفات المقاضي
        </Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          إضافة تصنيف
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>المعرف (slug)</TableCell>
              <TableCell>الصورة</TableCell>
              <TableCell>نوع الاستخدام</TableCell>

              <TableCell>التصنيف الأب</TableCell>

              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt=""
                      width={48}
                      style={{ borderRadius: 8 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {USAGE_TYPES.find((t) => t.value === cat.usageType)?.label ||
                    cat.usageType}
                </TableCell>
                <TableCell>
                  {cat.parent
                    ? categories.find((c) => c._id === cat.parent)?.name || "?"
                    : "بدون"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(cat)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog لإضافة/تعديل التصنيف */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "تعديل تصنيف" : "إضافة تصنيف"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="الاسم"
            value={form.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            label="المعرف (slug)"
            value={form.slug || ""}
            onChange={(e) => handleChange("slug", e.target.value)}
          />
          <TextField
            label="رابط الصورة (اختياري)"
            value={form.image || ""}
            onChange={(e) => handleChange("image", e.target.value)}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>نوع الاستخدام</InputLabel>
            <Select
              value={form.usageType || "grocery"}
              label="نوع الاستخدام"
              onChange={(e) => handleChange("usageType", e.target.value)}
            >
              {USAGE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>التصنيف الأب (اختياري)</InputLabel>
            <Select
              value={form.parent || ""}
              label="التصنيف الأب (اختياري)"
              onChange={(e) => handleChange("parent", e.target.value)}
            >
              <MenuItem value="">بدون</MenuItem>
              {categories
                .filter((cat) => !editId || cat._id !== editId)
                .map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
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
