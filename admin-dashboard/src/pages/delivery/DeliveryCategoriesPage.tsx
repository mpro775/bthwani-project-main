import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Switch,
  Avatar,
  useTheme,
  Chip,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  FileUpload,
  Search,
  Download,
} from "@mui/icons-material";
import axios from "../../utils/axios";
import { uploadFileToBunny } from "../../services/uploadFileToCloudinary";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SaveIcon from "@mui/icons-material/Save";
type UsageType = "grocery" | "restaurant" | "retail" | "all";

interface Category {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  parent?: Category | string | null;
  usageType?: UsageType;
  sortOrder?: number; // قيمة الترتيب في الداتابيز
  displayIndex?: number; // رقم العرض القادم من الـAPI عند withNumbers=1
}

interface CategoryForm {
  name: string;
  usageType: UsageType;
  imageFile: File | null;
  isActive: boolean;
  parent: string; // id للفئة الأصلية أو فارغ (رئيسية)
  sortOrder?: number; // تعيين أولوية عند الإضافة/التعديل (اختياري)
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function DeliveryCategoriesPage() {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [search, setSearch] = useState<string>("");

  const [usageTypeFilter, setUsageTypeFilter] = useState<UsageType>("all");

  const [orderDirty, setOrderDirty] = useState(false);

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    imageFile: null,
    isActive: true,
    usageType: "restaurant",
    parent: "",
    sortOrder: undefined,
  });

  const fetchMainCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        search?: string;
        withNumbers: number;
        usageType?: UsageType;
      } = {
        search: search || undefined,
        withNumbers: 1,
        // لا ترسل usageType في حالة "all"
        ...(usageTypeFilter !== "all" ? { usageType: usageTypeFilter } : {}),
      };
      const res = await axios.get<Category[]>("/delivery/categories/main", {
        params,
      });
      setMainCategories(res.data);
      setCategories(res.data);
      setSelectedParent("");
      setOrderDirty(false);
    } catch {
      setError("فشل في جلب بيانات الفئات");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (parentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Category[]>(
        `/delivery/categories/children/${parentId}`,
        { params: { withNumbers: 1 } }
      );
      setCategories(res.data);
      setSelectedParent(parentId);
      setOrderDirty(false);
    } catch {
      setError("فشل في جلب الفئات الفرعية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMainCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, usageTypeFilter]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    setCategories((prev) => {
      const next = reorder(
        prev,
        result.source.index,
        result.destination!.index
      );
      setOrderDirty(true);
      return next.map((c, i) => ({ ...c, displayIndex: i + 1 }));
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("اسم الفئة مطلوب");
      return;
    }
    if (!editing && !form.imageFile) {
      setError("يجب تحميل صورة للفئة");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let imageUrl = editing?.image || "";
      if (form.imageFile) {
        imageUrl = await uploadFileToBunny(form.imageFile);
      }
      const payload: {
        name: string;
        image: string;
        isActive: boolean;
        parent: string | null;
        usageType: UsageType;
        sortOrder?: number;
      } = {
        name: form.name,
        image: imageUrl,
        isActive: form.isActive,
        parent: form.parent || null,
        usageType: form.usageType,
      };
      if (typeof form.sortOrder === "number" && form.sortOrder >= 1) {
        payload.sortOrder = form.sortOrder;
      }

      if (editing) {
        await axios.put<Category>(
          `/delivery/categories/${editing._id}`,
          payload
        );
      } else {
        await axios.post<Category>("/delivery/categories", payload);
      }

      if (selectedParent) {
        await fetchSubCategories(selectedParent);
      } else {
        await fetchMainCategories();
      }
      setOpen(false);
      resetForm();
    } catch {
      setError("فشل في حفظ الفئة");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await axios.put(`/delivery/categories/${id}`, { isActive: active });
      if (selectedParent) {
        fetchSubCategories(selectedParent);
      } else {
        fetchMainCategories();
      }
    } catch {
      setError("فشل في تحديث الحالة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/delivery/categories/${id}`);
      if (selectedParent) {
        fetchSubCategories(selectedParent);
      } else {
        fetchMainCategories();
      }
    } catch {
      setError("فشل في حذف الفئة");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get<Blob>("/delivery/categories/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "categories_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("فشل في تصدير البيانات");
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      imageFile: null,
      isActive: true,
      parent: "",
      usageType: "restaurant",
      sortOrder: undefined,
    });
    setError(null);
  };

  return (
    <Box p={3}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: theme.palette.primary.main,
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          فئات التوصيل
        </Typography>

        {selectedParent && (
          <Button onClick={fetchMainCategories} variant="text" sx={{ mb: 2 }}>
            ← رجوع للفئات الرئيسية
          </Button>
        )}

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            select
            size="small"
            label="نوع الخدمة"
            value={usageTypeFilter}
            onChange={(e) => setUsageTypeFilter(e.target.value as UsageType)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="restaurant">مطاعم</MenuItem>
            <MenuItem value="grocery">سوبر ماركت</MenuItem>
            <MenuItem value="retail">تجزئة</MenuItem>
          </TextField>

          <TextField
            size="small"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMainCategories()}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ borderRadius: "8px", px: 3 }}
          >
            تصدير
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            sx={{
              borderRadius: "8px",
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            إضافة فئة
          </Button>
        </Box>
      </Box>

      {orderDirty && (
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={async () => {
            try {
              setLoading(true);
              await axios.post("/delivery/categories/bulk-reorder", {
                usageType: usageTypeFilter,
                parent: selectedParent || null,
                items: categories.map((c, i) => ({
                  _id: c._id,
                  sortOrder: i + 1,
                })),
              });
              setOrderDirty(false);
              if (selectedParent) fetchSubCategories(selectedParent);
              else fetchMainCategories();
            } catch {
              setError("فشل في حفظ الترتيب");
            } finally {
              setLoading(false);
            }
          }}
          sx={{ borderRadius: "8px", px: 3, mb: 2 }}
        >
          حفظ الترتيب
        </Button>
      )}

      {/* Loading and Error States */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Categories Table with Drag & Drop */}
      {!loading && (
        <Paper>
          <DragDropContext onDragEnd={onDragEnd}>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: 120 }}>
                    الترتيب
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>الصورة</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>الاسم</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>الحالة</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    تاريخ الإنشاء
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                    إجراءات
                  </TableCell>
                </TableRow>
              </TableHead>

              <Droppable droppableId="cats">
                {(provided) => (
                  <TableBody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {categories.map((cat, index) => (
                      <Draggable
                        draggableId={cat._id}
                        index={index}
                        key={cat._id}
                      >
                        {(drag) => (
                          <TableRow
                            hover
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconButton
                                  {...drag.dragHandleProps}
                                  size="small"
                                >
                                  <DragIndicatorIcon />
                                </IconButton>
                                <Chip
                                  label={`#${cat.displayIndex ?? index + 1}`}
                                  size="small"
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  (S:{cat.sortOrder ?? "?"})
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Avatar
                                src={cat.image}
                                sx={{
                                  width: 56,
                                  height: 56,
                                  border: `2px solid ${theme.palette.grey[300]}`,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <Typography fontWeight="medium">
                                {cat.name}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={cat.isActive ? "نشط" : "معطل"}
                                color={cat.isActive ? "success" : "error"}
                                sx={{ borderRadius: "6px", fontWeight: "bold" }}
                              />
                            </TableCell>

                            <TableCell>
                              {new Date(cat.createdAt).toLocaleDateString("ar")}
                            </TableCell>

                            <TableCell>
                              <Box
                                display="flex"
                                justifyContent="flex-end"
                                gap={1}
                              >
                                {!selectedParent && (
                                  <Tooltip title="عرض الفروع">
                                    <IconButton
                                      onClick={() =>
                                        fetchSubCategories(cat._id)
                                      }
                                      color="primary"
                                    >
                                      <Search />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip title="تعديل">
                                  <IconButton
                                    onClick={() => {
                                      setEditing(cat);
                                      setForm({
                                        name: cat.name,
                                        imageFile: null,
                                        isActive: cat.isActive,
                                        usageType:
                                          (cat.usageType as UsageType) ||
                                          "restaurant",
                                        parent:
                                          typeof cat.parent === "string"
                                            ? cat.parent
                                            : (cat.parent as Category)?._id ||
                                              "",
                                        sortOrder: cat.sortOrder,
                                      });
                                      setOpen(true);
                                    }}
                                    sx={{
                                      backgroundColor: theme.palette.info.light,
                                      color: theme.palette.info.contrastText,
                                      "&:hover": {
                                        backgroundColor:
                                          theme.palette.info.main,
                                      },
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="حذف">
                                  <IconButton
                                    onClick={() => handleDelete(cat._id)}
                                    sx={{
                                      backgroundColor:
                                        theme.palette.error.light,
                                      color: theme.palette.error.contrastText,
                                      "&:hover": {
                                        backgroundColor:
                                          theme.palette.error.main,
                                      },
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip
                                  title={cat.isActive ? "تعطيل" : "تفعيل"}
                                >
                                  <Switch
                                    checked={cat.isActive}
                                    onChange={() =>
                                      toggleActive(cat._id, !cat.isActive)
                                    }
                                    color="primary"
                                    sx={{
                                      "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: theme.palette.success.main,
                                      },
                                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                        {
                                          backgroundColor:
                                            theme.palette.success.main,
                                        },
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
        </Paper>
      )}

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
            fontWeight: "bold",
          }}
        >
          {editing ? "تعديل الفئة" : "إضافة فئة جديدة"}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              fullWidth
              label="اسم الفئة"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <TextField
              select
              label="نوع الخدمة"
              value={form.usageType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  usageType: e.target.value as UsageType,
                }))
              }
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            >
              <MenuItem value="restaurant">مطاعم</MenuItem>
              <MenuItem value="grocery">سوبر ماركت</MenuItem>
              <MenuItem value="retail">تجزئة</MenuItem>
            </TextField>

            <TextField
              select
              label="الفئة الأصلية (اختياري)"
              value={form.parent}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, parent: e.target.value }))
              }
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            >
              <MenuItem value="">بدون (فئة رئيسية)</MenuItem>
              {mainCategories.map((cat) => (
                <MenuItem value={cat._id} key={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="الأولوية (رقم الترتيب) — اختياري"
              value={form.sortOrder ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sortOrder: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              fullWidth
              inputProps={{ min: 1 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUpload />}
                fullWidth
                sx={{
                  borderRadius: "8px",
                  py: 1.5,
                  borderStyle: "dashed",
                  borderColor: form.imageFile
                    ? theme.palette.success.main
                    : theme.palette.divider,
                }}
              >
                {form.imageFile ? form.imageFile.name : "تحميل صورة الفئة"}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imageFile: e.target.files?.[0] || null,
                    }))
                  }
                />
              </Button>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              sx={{
                borderRadius: "8px",
                backgroundColor: theme.palette.grey[100],
              }}
            >
              <Typography>حالة الفئة</Typography>
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                color="primary"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 2,
            px: 3,
          }}
        >
          <Button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            variant="outlined"
            sx={{ borderRadius: "8px", px: 3 }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "8px",
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {editing ? "حفظ التعديلات" : "إضافة الفئة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
