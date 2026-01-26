import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Description as DocumentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileUpload as UploadIcon,
  FileDownload as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as ValidIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import type { SelectChangeEvent } from "@mui/material/Select";

import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  uploadDocumentFile,
  downloadDocument,
  getExpiringSoonDocuments,
  getExpiredDocuments,
  bulkDeleteDocuments,
  exportDocuments,
  type Document,
  type DocumentFormData,
} from "../../api/documents";
import { getAssets } from "../../api/assets";

const DocumentFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  document?: Document | null;
  onSubmit: (data: DocumentFormData) => void;
  loading: boolean;
}> = ({ open, onClose, document, onSubmit, loading }) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    type: "",
    category: "",
    issueDate: dayjs().format("YYYY-MM-DD"),
    fileUrl: "",
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
    enabled: open,
  });

  React.useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || "",
        type: document.type || "",
        asset: document.asset || "",
        category: document.category || "",
        issueDate: dayjs(document.issueDate).format("YYYY-MM-DD"),
        expiryDate: document.expiryDate
          ? dayjs(document.expiryDate).format("YYYY-MM-DD")
          : "",
        fileUrl: document.fileUrl || "",
        permissions: document.permissions || [],
        location: document.location || "",
      });
    } else {
      setFormData({
        title: "",
        type: "",
        category: "",
        issueDate: dayjs().format("YYYY-MM-DD"),
        fileUrl: "",
        permissions: [],
      });
    }
    setErrors({});
    setFile(null);
  }, [document, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان الوثيقة مطلوب";
    }

    if (!formData.type.trim()) {
      newErrors.type = "نوع الوثيقة مطلوب";
    }

    if (!formData.category.trim()) {
      newErrors.category = "فئة الوثيقة مطلوبة";
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "تاريخ الإصدار مطلوب";
    }

    if (!formData.fileUrl && !file) {
      newErrors.fileUrl = "يجب رفع الملف أو إدخال رابط الملف";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let fileUrl = formData.fileUrl;

    // Upload file if selected
    if (file) {
      try {
        const uploadResult = await uploadDocumentFile(file);
        fileUrl = uploadResult.fileUrl;
      } catch (error) {
        if (error instanceof Error) {
          setErrors({ fileUrl: error.message });
        } else {
          setErrors({ fileUrl: "فشل في رفع الملف" });
        }
        setErrors({ fileUrl: "فشل في رفع الملف" });
        return;
      }
    }

    onSubmit({
      ...formData,
      fileUrl,
    });
  };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleDateChange =
    (field: string) => (newValue: dayjs.Dayjs | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue?.format("YYYY-MM-DD") || "",
      }));
    };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, fileUrl: "" }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {document ? "تعديل وثيقة" : "إضافة وثيقة جديدة"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="عنوان الوثيقة"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />

          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>نوع الوثيقة</InputLabel>
            <Select
              value={formData.type}
              onChange={handleSelectChange("type")}
              label="نوع الوثيقة"
            >
              <MenuItem value="عقد">عقد</MenuItem>
              <MenuItem value="فاتورة">فاتورة</MenuItem>
              <MenuItem value="بوليصة">بوليصة</MenuItem>
              <MenuItem value="شهادة">شهادة</MenuItem>
              <MenuItem value="ترخيص">ترخيص</MenuItem>
              <MenuItem value="تقرير">تقرير</MenuItem>
              <MenuItem value="أخرى">أخرى</MenuItem>
            </Select>
            {errors.type && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.type}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>فئة الوثيقة</InputLabel>
            <Select
              value={formData.category}
              onChange={handleSelectChange("category")}
              label="فئة الوثيقة"
            >
              <MenuItem value="رسمي">رسمي</MenuItem>
              <MenuItem value="داخلي">داخلي</MenuItem>
              <MenuItem value="مالي">مالي</MenuItem>
              <MenuItem value="قانوني">قانوني</MenuItem>
              <MenuItem value="فني">فني</MenuItem>
              <MenuItem value="أخرى">أخرى</MenuItem>
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.category}
              </Typography>
            )}
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="تاريخ الإصدار"
              value={dayjs(formData.issueDate)}
              onChange={handleDateChange("issueDate")}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!errors.issueDate,
                  helperText: errors.issueDate,
                },
              }}
            />
          </LocalizationProvider>

          {formData.category === "رسمي" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="تاريخ الانتهاء (اختياري)"
                value={formData.expiryDate ? dayjs(formData.expiryDate) : null}
                onChange={handleDateChange("expiryDate")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          )}

          <FormControl fullWidth>
            <InputLabel>الأصل المرتبط (اختياري)</InputLabel>
            <Select
              value={formData.asset || ""}
              onChange={handleSelectChange("asset")}
              label="الأصل المرتبط (اختياري)"
            >
              <MenuItem value="">لا يوجد</MenuItem>
              {assets.map((asset) => (
                <MenuItem key={asset._id} value={asset._id}>
                  {asset.name} - {asset.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="الموقع"
            value={formData.location || ""}
            onChange={handleChange("location")}
            fullWidth
            placeholder="مثال: صنعاء، عدن، تعز..."
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ملف الوثيقة:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                size="small"
              >
                اختر ملف
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Button>

              {file && (
                <Chip
                  label={file.name}
                  onDelete={() => setFile(null)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}

              <TextField
                label="أو أدخل رابط الملف"
                value={formData.fileUrl}
                onChange={handleChange("fileUrl")}
                error={!!errors.fileUrl}
                helperText={errors.fileUrl}
                fullWidth
                size="small"
                placeholder="https://example.com/document.pdf"
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {document ? "تحديث" : "إضافة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function DocumentsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter] = useState<
    "all" | "valid" | "expiring" | "expired"
  >("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize ] = useState(10);

  const queryClient = useQueryClient();

  // Fetch documents
  const {
    data: documentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "documents",
      currentPage,
      pageSize,
      categoryFilter,
      typeFilter,
      statusFilter,
      searchTerm,
    ],
    queryFn: () =>
      getDocuments({
        page: currentPage,
        limit: pageSize,
        category: categoryFilter || undefined,
        type: typeFilter || undefined,
        expired: statusFilter === "expired" ? true : undefined,
        expiringSoon: statusFilter === "expiring" ? true : undefined,
      }),
  });

  // Fetch document statistics
  const { data: stats } = useQuery({
    queryKey: ["documentStats"],
    queryFn: getDocumentStats,
  });

  // Fetch expiring documents
  const { data: expiringDocuments = [] } = useQuery({
    queryKey: ["expiringDocuments"],
    queryFn: () => getExpiringSoonDocuments(30),
    enabled: activeTab === 1,
  });

  // Fetch expired documents
  const { data: expiredDocuments = [] } = useQuery({
    queryKey: ["expiredDocuments"],
    queryFn: getExpiredDocuments,
    enabled: activeTab === 2,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
      setDialogOpen(false);
      setEditingDocument(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      document,
    }: {
      id: string;
      document: Partial<DocumentFormData>;
    }) => updateDocument(id, document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
      setDialogOpen(false);
      setEditingDocument(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
      setDeleteConfirm(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documentStats"] });
      setSelectedDocuments([]);
    },
  });

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setDialogOpen(true);
  };

  const handleDelete = (document: Document) => {
    setDeleteConfirm(document);
  };

  const handleDownload = async (document: Document) => {
    try {
      const blob = await downloadDocument(document._id!);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportDocuments({
        format: "excel",
        category: categoryFilter || undefined,
        type: typeFilter || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `documents_${dayjs().format("YYYY-MM-DD")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleFormSubmit = (formData: DocumentFormData) => {
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument._id!, document: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const documents = documentsData?.documents || [];
  const pagination = documentsData?.pagination;

  const getCurrentDocuments = () => {
    switch (activeTab) {
      case 0:
        return documents; // All documents
      case 1:
        return expiringDocuments; // Expiring soon
      case 2:
        return expiredDocuments; // Expired
      default:
        return documents;
    }
  };

  const filteredDocuments = getCurrentDocuments().filter((document) => {
    const matchesSearch =
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.location &&
        document.location.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const getStatusColor = (document: Document) => {
    if (!document.expiryDate) return "default";

    const expiryDate = dayjs(document.expiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiryDate.diff(now, "day");

    if (daysUntilExpiry < 0) return "error"; // Expired
    if (daysUntilExpiry <= 30) return "warning"; // Expiring soon
    return "success"; // Valid
  };

  const getStatusIcon = (document: Document) => {
    if (!document.expiryDate) return <DocumentIcon />;

    const expiryDate = dayjs(document.expiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiryDate.diff(now, "day");

    if (daysUntilExpiry < 0) return <WarningIcon color="error" />;
    if (daysUntilExpiry <= 30) return <WarningIcon color="warning" />;
    return <ValidIcon color="success" />;
  };

  const getStatusText = (document: Document) => {
    if (!document.expiryDate) return "بدون تاريخ انتهاء";

    const expiryDate = dayjs(document.expiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiryDate.diff(now, "day");

    if (daysUntilExpiry < 0) return "منتهي الصلاحية";
    if (daysUntilExpiry === 0) return "ينتهي اليوم";
    if (daysUntilExpiry === 1) return "ينتهي غداً";
    if (daysUntilExpiry <= 30) return `ينتهي خلال ${daysUntilExpiry} يوم`;
    return "صالح";
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY-MM-DD");
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">خطأ في تحميل الوثائق: {error.message}</Alert>
      </Box>
    );
  }

  return (
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
          إدارة الوثائق
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedDocuments.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => bulkDeleteMutation.mutate(selectedDocuments)}
            >
              حذف المحدد ({selectedDocuments.length})
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            تصدير
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingDocument(null);
              setDialogOpen(true);
            }}
          >
            إضافة وثيقة
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DocumentIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                      {stats.totalDocuments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الوثائق
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                      {stats.expiringSoon}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      تنتهي قريباً
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WarningIcon color="error" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                      {stats.expiredDocuments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      منتهية الصلاحية
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ValidIcon color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                      {stats.totalDocuments - stats.expiredDocuments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      وثائق صالحة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="جميع الوثائق" />
          <Tab label="تنتهي قريباً" />
          <Tab label="منتهية الصلاحية" />
        </Tabs>
      </Paper>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="البحث في الوثائق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="الفئة"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="رسمي">رسمي</MenuItem>
                <MenuItem value="داخلي">داخلي</MenuItem>
                <MenuItem value="مالي">مالي</MenuItem>
                <MenuItem value="قانوني">قانوني</MenuItem>
                <MenuItem value="فني">فني</MenuItem>
                <MenuItem value="أخرى">أخرى</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>النوع</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="النوع"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="عقد">عقد</MenuItem>
                <MenuItem value="فاتورة">فاتورة</MenuItem>
                <MenuItem value="بوليصة">بوليصة</MenuItem>
                <MenuItem value="شهادة">شهادة</MenuItem>
                <MenuItem value="ترخيص">ترخيص</MenuItem>
                <MenuItem value="تقرير">تقرير</MenuItem>
                <MenuItem value="أخرى">أخرى</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={`${filteredDocuments.length} وثيقة`}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>العنوان</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>الفئة</TableCell>
                  <TableCell>تاريخ الإصدار</TableCell>
                  <TableCell>تاريخ الانتهاء</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الموقع</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {document.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{document.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(document.issueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.expiryDate
                          ? formatDate(document.expiryDate)
                          : "بدون تاريخ"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getStatusIcon(document)}
                        <Chip
                          label={getStatusText(document)}
                          color={getStatusColor(document)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.location || "غير محدد"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="تحميل">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(document)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(document)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(document)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            السابق
          </Button>

          <Typography sx={{ mx: 2, alignSelf: "center" }}>
            صفحة {pagination.page} من {pagination.pages}
          </Typography>

          <Button
            variant="outlined"
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            التالي
          </Button>
        </Box>
      )}

      {filteredDocuments.length === 0 && !isLoading && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          <DocumentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">لا توجد وثائق</Typography>
          <Typography variant="body2">
            {searchTerm || categoryFilter || typeFilter
              ? "جرب مصطلح بحث مختلف أو تغيير الفلاتر"
              : "ابدأ بإضافة وثيقة جديدة"}
          </Typography>
        </Box>
      )}

      {/* Document Form Dialog */}
      <DocumentFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingDocument(null);
        }}
        document={editingDocument}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الوثيقة "{deleteConfirm?.title}"؟ لا يمكن
            التراجع عن هذا الإجراء.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>إلغاء</Button>
          <Button
            onClick={() => {
              if (deleteConfirm) {
                deleteMutation.mutate(deleteConfirm._id!);
              }
            }}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={16} /> : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
