// src/pages/admin/AdminVendorsPage.tsx
import { useEffect, useState, Component, useCallback } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Toolbar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

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

interface Store {
  _id: string;
  name: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Box p={3} textAlign="center">
            <Typography color="error" variant="h6">
              حدث خطأ في تحميل البيانات
            </Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              إعادة تحميل الصفحة
            </Button>
          </Box>
        )
      );
    }

    return this.props.children;
  }
}

function AdminVendorsPage() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    store: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const token = await user.getIdToken(true);
      const [vRes, sRes] = await Promise.all([
        axios.get("/admin/vendors", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/delivery/stores", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Ensure vendors data is an array
      if (Array.isArray(vRes?.data)) {
        setVendors(vRes.data);
      } else {
        console.error("Expected vendors array but received:", vRes?.data);
        setVendors([]);
      }

      // Ensure stores data is an array
      if (Array.isArray(sRes?.data)) {
        setStores(sRes.data);
      } else {
        console.error("Expected stores array but received:", sRes?.data);
        setStores([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("فشل في جلب البيانات. يرجى المحاولة مرة أخرى");
      setVendors([]);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) fetchData();
      else navigate("/login");
    });
    return unsub;
  }, [navigate, fetchData]);

  const openDialog = () => {
    setForm({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      store: "",
      isActive: true,
    });
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.password || !form.store) {
      setError("يرجى ملء الحقول المطلوبة");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/vendor", form);
      setSnackbar({ open: true, message: "تم إنشاء التاجر بنجاح" });
      closeDialog();
      fetchData();
    } catch {
      setError("فشل في جلب البيانات");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Toolbar disableGutters sx={{ justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">إدارة التجار</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={openDialog}
        >
          جديد
        </Button>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>الهاتف</TableCell>
              <TableCell>البريد</TableCell>
              <TableCell>المتجر</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>عدد المبيعات</TableCell>
              <TableCell>الإيرادات</TableCell>
              <TableCell align="right">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(vendors) && vendors.length > 0 ? (
              vendors.map((v) => (
                <TableRow key={v._id}>
                  <TableCell>{v.fullName}</TableCell>
                  <TableCell>{v.phone}</TableCell>
                  <TableCell>{v.email || "—"}</TableCell>
                  <TableCell>{v.store?.name || "—"}</TableCell>
                  <TableCell>{v.isActive ? "مفعل" : "موقوف"}</TableCell>
                  <TableCell>{v.salesCount || 0}</TableCell>
                  <TableCell>{(v.totalRevenue || 0).toFixed(2)} ر.س</TableCell>
                  <TableCell align="right">
                    <Tooltip title="تعديل">
                      <IconButton
                        onClick={() => navigate(`/admin/vendors/${v._id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    {loading ? "جاري التحميل..." : "لا توجد بيانات متاحة"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>إضافة تاجر جديد</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="الاسم بالكامل"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              required
              fullWidth
            />
            <TextField
              label="الهاتف"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              required
              fullWidth
            />
            <TextField
              label="البريد الإلكتروني"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="كلمة المرور"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              fullWidth
            />
            <TextField
              select
              label="المتجر"
              value={form.store}
              onChange={(e) =>
                setForm((f) => ({ ...f, store: e.target.value }))
              }
              required
              fullWidth
            >
              {stores.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
              }
              label="مفعل"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}

export default function AdminVendorsPageWithBoundary() {
  return (
    <ErrorBoundary>
      <AdminVendorsPage />
    </ErrorBoundary>
  );
}
