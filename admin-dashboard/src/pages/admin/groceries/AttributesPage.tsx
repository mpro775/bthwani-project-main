// src/pages/admin/groceries/AttributesPage.tsx
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
  slug: string;
  categories: PopulatedCategory[]; // <-- مصفوفة
  unit?: string;
  type: "number" | "select" | "text";
  options?: string[];
  usageType?: string;
};
type PopulatedCategory = { _id: string; name: string } | string;

type Category = {
  _id: string;
  name: string;
};
const USAGE_TYPES = [
  { value: "grocery", label: "مقاضي" },
  { value: "restaurant", label: "مطاعم" },
  { value: "retail", label: "تجزئة" },
];
export default function GroceriesAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Attribute>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [optionsStr, setOptionsStr] = useState("");

  // جلب التصنيفات (مطلوب لربط السمة بتصنيف)
  const fetchCategories = async () => {
    const data = await merchantApi.getCategories();
    setCategories(data);
  };

  const fetchAttributes = async () => {
    const data = await merchantApi.getAttributes();
    setAttributes(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchAttributes();
  }, []);

  const handleOpen = (attr?: Attribute) => {
    if (attr) {
      // 👇 هنا التعديل الهام
      setForm({
        ...attr,
        categories: (attr.categories || []).map((c) =>
          typeof c === "string" ? c : c._id
        ),
      });
      setEditId(attr._id);
      setOptionsStr((attr.options || []).join(","));
    } else {
      setForm({});
      setEditId(null);
      setOptionsStr("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({});
    setEditId(null);
    setOptionsStr("");
  };
  const handleChange = (
    field: keyof Attribute,
    value: string | string[] | undefined
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.slug ||
      !form.type ||
      !form.categories ||
      !form.categories.length ||
      !form.usageType
    ) {
      alert("كل الحقول الإلزامية مطلوبة");
      return;
    }
    const submitData: Partial<Attribute> = { ...form };
    if (form.type === "select" && optionsStr) {
      submitData.options = optionsStr.split(",").map((s: string) => s.trim());
    }
    if (editId) {
      await merchantApi.updateAttribute(editId, submitData);
    } else {
      await merchantApi.createAttribute(submitData);
    }
    handleClose();
    fetchAttributes();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      await merchantApi.deleteAttribute(id);
      fetchAttributes();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة سمات المقاضي
        </Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          إضافة سمة
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>التصنيف</TableCell>
              <TableCell>الوحدة</TableCell>
              <TableCell>النوع</TableCell>
              <TableCell>الخيارات (إن وجدت)</TableCell>
              <TableCell>نوع الاستخدام</TableCell>

              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attributes.map((attr) => (
              <TableRow key={attr._id}>
                <TableCell>{attr.name}</TableCell>
                <TableCell>{attr.slug}</TableCell>
                <TableCell>
                  {(attr.categories || [])
                    .map((cat) =>
                      typeof cat === "object" && cat !== null && "name" in cat
                        ? cat.name
                        : cat
                    )
                    .join(", ")}
                </TableCell>
                <TableCell>{attr.unit || ""}</TableCell>
                <TableCell>{attr.type}</TableCell>
                <TableCell>
                  {attr.type === "select" && attr.options
                    ? attr.options.join(", ")
                    : ""}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(attr)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(attr._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
                <TableCell>
                  {USAGE_TYPES.find((t) => t.value === attr.usageType)?.label ||
                    attr.usageType}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog لإضافة/تعديل السمة */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "تعديل سمة" : "إضافة سمة"}</DialogTitle>
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
          <FormControl fullWidth>
            <InputLabel>التصنيفات</InputLabel>
            <Select
              multiple
              value={form.categories || []}
              label="التصنيفات"
              onChange={(e) =>
                handleChange("categories", e.target.value as string[])
              }
              renderValue={(selected) =>
                (selected as string[])
                  .map(
                    (id) => categories.find((cat) => cat._id === id)?.name || id
                  )
                  .join(", ")
              }
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>نوع الاستخدام</InputLabel>
            <Select
              value={form.usageType || ""}
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

          <TextField
            label="الوحدة (اختياري)"
            value={form.unit || ""}
            onChange={(e) => handleChange("unit", e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>نوع السمة</InputLabel>
            <Select
              value={form.type || ""}
              label="نوع السمة"
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <MenuItem value="number">رقمي</MenuItem>
              <MenuItem value="select">اختيارات</MenuItem>
              <MenuItem value="text">نص</MenuItem>
            </Select>
          </FormControl>
          {form.type === "select" && (
            <TextField
              label="الخيارات (افصل بينهم بفاصلة)"
              value={optionsStr}
              onChange={(e) => setOptionsStr(e.target.value)}
              helperText="مثال: صغير,وسط,كبير"
            />
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
