import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import {
  getKenzCategoriesList,
  createKenzCategory,
  updateKenzCategory,
  deleteKenzCategory,
  type KenzCategoryFlat,
} from "../../../api/kenz";
import RequireAdminPermission from "../../../components/RequireAdminPermission";

const KenzCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<KenzCategoryFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    slug: "",
    parentId: "" as string | null,
    order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    item: KenzCategoryFlat | null;
  }>({ open: false, item: null });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getKenzCategoriesList();
      setItems(list);
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: "فشل في تحميل الفئات",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ nameAr: "", nameEn: "", slug: "", parentId: null, order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: KenzCategoryFlat) => {
    setEditingId(item._id);
    setForm({
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      slug: item.slug,
      parentId: item.parentId || null,
      order: item.order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nameAr.trim() || !form.nameEn.trim() || !form.slug.trim()) {
      setSnackbar({
        open: true,
        message: "الاسم بالعربية والإنجليزية والـ slug مطلوبة",
        severity: "error",
      });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateKenzCategory(editingId, {
          nameAr: form.nameAr.trim(),
          nameEn: form.nameEn.trim(),
          slug: form.slug.trim(),
          parentId: form.parentId || null,
          order: form.order,
        });
        setSnackbar({
          open: true,
          message: "تم تحديث الفئة",
          severity: "success",
        });
      } else {
        await createKenzCategory({
          nameAr: form.nameAr.trim(),
          nameEn: form.nameEn.trim(),
          slug: form.slug.trim(),
          parentId: form.parentId || null,
          order: form.order,
        });
        setSnackbar({
          open: true,
          message: "تم إنشاء الفئة",
          severity: "success",
        });
      }
      setDialogOpen(false);
      loadCategories();
    } catch (e) {
      setSnackbar({
        open: true,
        message: (e as Error)?.message || "فشل في الحفظ",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.item) return;
    try {
      await deleteKenzCategory(deleteConfirm.item._id);
      setSnackbar({ open: true, message: "تم حذف الفئة", severity: "success" });
      setDeleteConfirm({ open: false, item: null });
      loadCategories();
    } catch (e) {
      setSnackbar({
        open: true,
        message: (e as Error)?.message || "فشل في الحذف",
        severity: "error",
      });
    }
  };

  const parentOptions = items.filter((c) => !editingId || c._id !== editingId);

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
            فئات كنز
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate("/admin/kenz")}>
              إعلانات الكنز
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
            >
              إضافة فئة
            </Button>
          </Box>
        </Box>

        <Paper>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <FolderIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography sx={{ mt: 1 }}>
                لا توجد فئات. أضف فئة من الزر أعلاه.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم (عربي)</TableCell>
                  <TableCell>الاسم (إنجليزي)</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>الفئة الأب</TableCell>
                  <TableCell>الترتيب</TableCell>
                  <TableCell>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row.nameAr}</TableCell>
                    <TableCell>{row.nameEn}</TableCell>
                    <TableCell>{row.slug}</TableCell>
                    <TableCell>
                      {row.parentId
                        ? items.find((c) => c._id === row.parentId)?.nameAr ??
                          row.parentId
                        : "—"}
                    </TableCell>
                    <TableCell>{row.order}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(row)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setDeleteConfirm({ open: true, item: row })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingId ? "تعديل فئة" : "إضافة فئة جديدة"}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="الاسم بالعربية"
              value={form.nameAr}
              onChange={(e) =>
                setForm((f) => ({ ...f, nameAr: e.target.value }))
              }
              sx={{ mt: 1 }}
            />
            <TextField
              fullWidth
              label="الاسم بالإنجليزية"
              value={form.nameEn}
              onChange={(e) =>
                setForm((f) => ({ ...f, nameEn: e.target.value }))
              }
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Slug (معرف فريد في الرابط)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الفئة الأب</InputLabel>
              <Select
                value={form.parentId || ""}
                label="الفئة الأب"
                onChange={(e) =>
                  setForm((f) => ({ ...f, parentId: e.target.value || null }))
                }
              >
                <MenuItem value="">— لا يوجد —</MenuItem>
                {parentOptions.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.nameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="ترتيب العرض"
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  order: parseInt(e.target.value, 10) || 0,
                }))
              }
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={24} /> : "حفظ"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, item: null })}
        >
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogContent>
            <Typography>
              هل تريد حذف الفئة &quot;{deleteConfirm.item?.nameAr}&quot;؟ الفئات
              الفرعية ستصبح في المستوى الأعلى.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirm({ open: false, item: null })}
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              حذف
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default KenzCategoriesPage;
