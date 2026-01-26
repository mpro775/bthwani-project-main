// src/pages/admin/vendors/VendorsManagement.tsx
// إدارة التُجّار (Vendors Management) — بلا أي استخدام لـ `any`
// يشمل:
// - VendorsListPage: قائمة التُجّار مع فلاتر (الحالة/المدينة/التصنيف) وبحث وفرز وتصفح
// - VendorProfilePage: ملف تاجر (بيانات أساسية، العمولات/الرسوم، التوصيل، المستندات المبسطة، الفروع)
// - ربط API وفق المواصفات:
//   GET    /admin/vendors
//   POST   /admin/vendors
//   GET    /admin/vendors/:id
//   PATCH  /admin/vendors/:id
//   PATCH  /admin/vendors/:id/status
//   POST   /admin/vendors/:id/branches
//   PATCH  /admin/vendors/:id/branches/:branchId
// - صلاحيات متوقعة: vendors:*

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
  Tabs,
  Tab,
  Switch,
} from "@mui/material";
import {
  Add,
  Edit,
  Search,
  Save,
  Refresh,
  Store,
  Map,
  LockOpen,
  Lock,
} from "@mui/icons-material";
import axios from "../../../utils/axios";

// ========= Types =========
export type VendorStatus = "active" | "suspended" | "pending";

export interface VendorCommission {
  deliveryType: "self" | "third-party"; // التوصيل ذاتي أم طرف ثالث
  commissionRate: number; // نسبة العمولة % (0..100)
  fixedFee?: number; // رسوم ثابتة اختيارية
}

export interface VendorBranchHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  open: string; // HH:mm
  close: string; // HH:mm
  closed?: boolean;
}

export interface VendorBranch {
  _id?: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  hours: VendorBranchHours[];
  phone?: string;
  isActive: boolean;
}

export interface VendorBasic {
  _id?: string;
  fullName: string; // اسم المالك الكامل
  phone: string;
  email?: string;
  store: {
    _id: string;
    name: string; // اسم المتجر (tradeName)
    address: string;
  };
  city?: string; // قد نحتاج استخراجه من العنوان
  category?: string; // التصنيف
  logoUrl?: string;
  rating?: number; // 0..5
  status: VendorStatus;
  commissions: VendorCommission[];
  deliveryType: "self" | "third-party";
  isActive: boolean;
  source?: string;
  salesCount?: number;
  totalRevenue?: number;
  createdAt?: string;
  updatedAt?: string; // ISO
}

export interface VendorProfile extends VendorBasic {
  documents?: {
    key: string;
    url: string;
    status: "valid" | "expired" | "pending";
  }[];
  branches: VendorBranch[];
  createdByMarketer?: {
    _id: string;
    fullName: string;
    phone: string;
  };
}

export interface VendorsListItem {
  _id: string;
  fullName: string; // اسم المالك الكامل
  phone: string;
  email?: string;
  store: {
    _id: string;
    name: string; // اسم المتجر (tradeName)
    address: string;
  };
  isActive: boolean;
  city?: string; // قد نحتاج استخراجه من العنوان
  category?: string; // قد نحتاج إضافته لاحقاً
  rating?: number;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  source?: string;
  salesCount?: number;
  totalRevenue?: number;
  createdByMarketer?: {
    _id: string;
    fullName: string;
    phone: string;
  };
}

export interface VendorsListResponse {
  data: VendorsListItem[];
  total: number;
}

// ========= Helpers =========
const STATUS_LABEL: Record<VendorStatus, string> = {
  active: "نشط",
  suspended: "موقوف",
  pending: "بانتظار",
};

// دالة تطبيع آمنة للبيانات من الـ API
const normalizeVendor = (v: Partial<VendorProfile> | undefined, id: string): VendorProfile => ({
  _id: v?._id ?? id,
  fullName: v?.fullName ?? "",
  phone: v?.phone ?? "",
  email: v?.email ?? "",
  store: {
    _id: v?.store?._id ?? "",
    name: v?.store?.name ?? "",
    address: v?.store?.address ?? "",
  },
  city: v?.city ?? "",
  category: v?.category ?? "",
  logoUrl: v?.logoUrl ?? "",
  rating: typeof v?.rating === "number" ? v.rating : 0,
  status: (v?.status as VendorStatus) ?? "pending",
  deliveryType: (v?.deliveryType as "self" | "third-party") ?? "self",
  commissions: Array.isArray(v?.commissions) && v.commissions.length
    ? v.commissions
    : [{ deliveryType: "self", commissionRate: 0 }],
  branches: Array.isArray(v?.branches) ? v.branches : [],
  documents: Array.isArray(v?.documents) ? v.documents : [],
  isActive: typeof v?.isActive === "boolean" ? v.isActive : true,
  source: v?.source ?? "",
  salesCount: v?.salesCount ?? 0,
  totalRevenue: v?.totalRevenue ?? 0,
});

// دالة تطبيع لقائمة التجار
const normalizeVendorListItem = (v: unknown, id: string): VendorsListItem => {
  const vendor = v && typeof v === 'object' ? v as Record<string, unknown> : {};

  return {
    _id: (vendor._id as string) ?? id,
    fullName: (vendor.fullName as string) ?? "",
    phone: (vendor.phone as string) ?? "",
    email: (vendor.email as string) ?? "",
    store: {
      _id: ((vendor.store as Record<string, unknown>)?.["_id"] as string) ?? "",
      name: ((vendor.store as Record<string, unknown>)?.["name"] as string) ?? "",
      address: ((vendor.store as Record<string, unknown>)?.["address"] as string) ?? "",
    },
    isActive: typeof (vendor.isActive) === "boolean" ? vendor.isActive : true,
    city: (vendor.city as string) ?? "",
    category: (vendor.category as string) ?? "",
    rating: typeof (vendor.rating) === "number" ? vendor.rating : undefined,
    status: (vendor.status as VendorStatus) ?? "pending",
    createdAt: (vendor.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (vendor.updatedAt as string) ?? new Date().toISOString(),
    source: (vendor.source as string) ?? "",
    salesCount: (vendor.salesCount as number) ?? 0,
    totalRevenue: (vendor.totalRevenue as number) ?? 0,
  };
};

// ========= API Layer (Typed) =========
interface ListParams {
  page: number; // 1-based
  pageSize: number;
  status?: VendorStatus;
  city?: string;
  category?: string;
  query?: string; // search
}

async function apiListVendors(
  params: ListParams
): Promise<VendorsListResponse> {
  // نرسل كلا الاسمين pageSize/limit تحسباً لاختلاف أسماء البارامترات في الباك
  const q = {
    page: params.page,               // 1-based
    pageSize: params.pageSize,
    limit: params.pageSize,          // بديل شائع
    status: params.status,
    city: params.city,
    category: params.category,
    query: params.query,
  };

  const { data } = await axios.get("/admin/vendors", { params: q });

  // 1) مصفوفة مباشرة: [...]
  if (Array.isArray(data)) {
    return { data, total: data.length };
  }

  // 2) شكل قياسي: { data: [...], total: N }
  if (data && Array.isArray(data.data)) {
    const total = typeof data.total === "number" ? data.total : data.data.length;
    return { data: data.data, total };
  }

  // 3) أشكال بديلة شائعة: { items: [...], count: N } أو { vendors: [...], totalCount: N }
  if (data && (Array.isArray(data.items) || Array.isArray(data.vendors))) {
    const list = data.items ?? data.vendors ?? [];
    const total = data.count ?? data.totalCount ?? list.length ?? 0;
    return { data: list, total: Number(total) };
  }

  // fallback
  return { data: [], total: 0 };
}

// async function apiCreateVendor(payload: VendorBasic): Promise<{ _id: string }> {
//   const { data } = await axios.post("/admin/vendors", payload);
//   return data as { _id: string };
// }

// استبدل الدالة بواحدة تُرجع VendorProfile
async function apiGetVendor(id: string): Promise<VendorProfile> {
  const { data } = await axios.get(`/admin/vendors/${id}`);
  // يدعم الشكلين: {data:{...}} أو {...} مباشرة
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data as VendorProfile;
  }
  return data as VendorProfile;
}

async function apiPatchVendor(
  id: string,
  payload: Partial<VendorProfile>
): Promise<VendorProfile> {
  const { data } = await axios.patch(`/admin/vendors/${id}`, payload);
  return (data && data.data ? data.data : data) as VendorProfile;
}

async function apiPatchStatus(
  id: string,
  status: VendorStatus
): Promise<VendorStatus> {
  const { data } = await axios.patch(`/admin/vendors/${id}/status`, { status });
  // يدعم {ok,status} أو {data:{status}} أو مجرد {status}
  if (data?.data?.status) return data.data.status as VendorStatus;
  if (data?.status) return data.status as VendorStatus;
  return status;
}

async function apiCreateBranch(
  id: string,
  branch: VendorBranch
): Promise<VendorBranch> {
  const { data } = await axios.post(`/admin/vendors/${id}/branches`, branch);
  return (data && data.data ? data.data : data) as VendorBranch;
}

async function apiPatchBranch(
  id: string,
  branchId: string,
  branch: Partial<VendorBranch>
): Promise<VendorBranch> {
  const { data } = await axios.patch(
    `/admin/vendors/${id}/branches/${branchId}`,
    branch
  );
  return (data && data.data ? data.data : data) as VendorBranch;
}


// ========= Vendors List Page =========
export function VendorsListPage() {
  const [status, setStatus] = useState<VendorStatus | "">("");
  const [city, setCity] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const [page, setPage] = useState<number>(0); // 0-based UI
  const [pageSize, setPageSize] = useState<number>(10);

  const [rows, setRows] = useState<VendorsListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev?: "success" | "error";
  }>({ open: false, msg: "" });

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiListVendors({
        page: page + 1,
        pageSize,
        status: status || undefined,
        city: city || undefined,
        category: category || undefined,
        query: query || undefined,
      });
      // طبيع البيانات الخام إلى VendorsListItem
      const normalized = Array.isArray(res.data)
        ? res.data.map((v: unknown) => {
            const vendorId = (v && typeof v === 'object' && v !== null && '_id' in v)
              ? String((v as Record<string, unknown>)._id || '')
              : '';
            return normalizeVendorListItem(v, vendorId);
          })
        : [];

      setRows(normalized);
      setTotal(typeof res.total === 'number' ? res.total : normalized.length);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "تعذر جلب التُجّار";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, city, category, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtersApplied = useMemo(
    () => Boolean(status || city || category || query),
    [status, city, category, query]
  );

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">إدارة التُجّار</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="تحديث">
            <IconButton onClick={() => void load()} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            size="small"
            placeholder="بحث بالاسم التجاري/القانوني/المالك"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", md: 360 } }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
          >
            <TextField
              select
              size="small"
              label="الحالة"
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus | "")}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="suspended">موقوف</MenuItem>
              <MenuItem value="pending">بانتظار</MenuItem>
            </TextField>

            <TextField
              size="small"
              label="المدينة"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              label="التصنيف"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ minWidth: 160 }}
            />

            {filtersApplied && (
              <Button
                variant="text"
                onClick={() => {
                  setStatus("");
                  setCity("");
                  setCategory("");
                  setQuery("");
                  setPage(0);
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>الهاتف</TableCell>
                <TableCell>البريد الإلكتروني</TableCell>
                <TableCell>المتجر</TableCell>
                <TableCell align="center">التقييم</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell align="right">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : (rows || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box py={6} textAlign="center">
                      لا توجد نتائج
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                (rows || []).map((v) => (
                  <TableRow key={v._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={""}>
                          <Store fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {v.store?.name || "اسم المتجر"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {v.fullName}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>{v.email || "—"}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {v.store?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {v.store?.address}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {typeof v.rating === "number" ? v.rating.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={v.isActive ? "نشط" : "غير نشط"}
                        color={v.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(v.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="فتح الملف">
                          <IconButton
                            size="small"
                            onClick={() => {
                              // الانتقال إلى صفحة الملف (Router خارجي)
                              window.location.assign(`/admin/vendors/${v._id}`);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            const n = parseInt(e.target.value, 10);
            setPageSize(n);
            setPage(0);
          }}
          labelRowsPerPage="عدد الصفوف"
        />
      </Paper>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        message={error || ""}
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.msg}
      />
    </Box>
  );
}

// ========= Vendor Profile Page =========
export function VendorProfilePage({ id }: { id: string }) {
  const [tab, setTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev?: "success" | "error";
  }>({ open: false, msg: "" });

  const [model, setModel] = useState<VendorProfile>({
    _id: id,
    fullName: "",
    phone: "",
    email: "",
    store: {
      _id: "",
      name: "",
      address: "",
    },
    city: "",
    category: "",
    logoUrl: "",
    rating: 0,
    status: "pending",
    deliveryType: "self",
    commissions: [{ deliveryType: "self", commissionRate: 0 }],
    branches: [],
    documents: [],
    isActive: true,
    source: "",
    salesCount: 0,
    totalRevenue: 0,
  });

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const raw = await apiGetVendor(id);
      setModel(normalizeVendor(raw, id));  // 👈 يضمن وجود مصفوفات بدل undefined
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "تعذر جلب بيانات التاجر";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async (): Promise<void> => {
    try {
      setSaving(true);
      const payload: Partial<VendorProfile> = {
        fullName: model.fullName,
        phone: model.phone,
        email: model.email,
        store: model.store,
        city: model.city,
        category: model.category,
        logoUrl: model.logoUrl,
        deliveryType: model.deliveryType,
        commissions: model.commissions ?? [],
        rating: model.rating,
      };
      const updated = await apiPatchVendor(id, payload);
      // طبيع البيانات المحدثة وقم بتحديث الحالة مباشرة
      const normalized = normalizeVendor(updated, id);
      setModel(normalized);
      setToast({ open: true, msg: "تم الحفظ", sev: "success" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "فشل الحفظ";
      setToast({ open: true, msg: message, sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onToggleStatus = async (): Promise<void> => {
    try {
      const next: VendorStatus =
        model.status === "active" ? "suspended" : "active";
      await apiPatchStatus(id, next);
      setModel({ ...model, status: next });
      setToast({
        open: true,
        msg: `تم تغيير الحالة إلى ${STATUS_LABEL[next]}`,
        sev: "success",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "فشل تغيير الحالة";
      setToast({ open: true, msg: message, sev: "error" });
    }
  };

  const onAddBranch = async (branch: VendorBranch): Promise<void> => {
    try {
      await apiCreateBranch(id, branch);
      setToast({ open: true, msg: "تمت إضافة الفرع", sev: "success" });
      void load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "فشل إضافة الفرع";
      setToast({ open: true, msg: message, sev: "error" });
    }
  };

  const onUpdateBranch = async (
    branchId: string,
    patch: Partial<VendorBranch>
  ): Promise<void> => {
    try {
      await apiPatchBranch(id, branchId, patch);
      setToast({ open: true, msg: "تم تحديث الفرع", sev: "success" });
      void load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "فشل تحديث الفرع";
      setToast({ open: true, msg: message, sev: "error" });
    }
  };

  if (loading)
    return (
      <Box p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={model.logoUrl} sx={{ width: 48, height: 48 }}>
            <Store />
          </Avatar>
          <Box>
            <Typography variant="h6">
              {model.store?.name || "اسم المتجر"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {model.fullName} • {model.store?.address}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            label={STATUS_LABEL[model.status]}
            color={
              model.status === "active"
                ? "success"
                : model.status === "pending"
                ? "warning"
                : "default"
            }
          />
          <Button
            startIcon={model.status === "active" ? <Lock /> : <LockOpen />}
            variant="outlined"
            onClick={() => void onToggleStatus()}
          >
            {model.status === "active" ? "إيقاف مؤقت" : "تفعيل"}
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            onClick={() => void onSave()}
            disabled={saving}
          >
            حفظ
          </Button>
        </Stack>
      </Stack>

      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          <Tab label="البيانات الأساسية" />
          <Tab label="الرسوم/العمولات" />
          <Tab label="التوصيل" />
          <Tab label="المستندات" />
          <Tab label="الفروع" />
        </Tabs>
        <Divider />
        {tab === 0 && (
          <Box p={2}>
            <Stack spacing={2} maxWidth={720}>
              <TextField
                label="اسم المالك الكامل"
                value={model.fullName}
                onChange={(e) =>
                  setModel({ ...model, fullName: e.target.value })
                }
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="الهاتف"
                  value={model.phone}
                  onChange={(e) =>
                    setModel({ ...model, phone: e.target.value })
                  }
                />
                <TextField
                  label="البريد الإلكتروني"
                  value={model.email || ""}
                  onChange={(e) =>
                    setModel({ ...model, email: e.target.value })
                  }
                />
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="اسم المتجر"
                  value={model.store?.name || ""}
                  onChange={(e) =>
                    setModel({
                      ...model,
                      store: { ...model.store, name: e.target.value }
                    })
                  }
                />
                <TextField
                  label="عنوان المتجر"
                  value={model.store?.address || ""}
                  onChange={(e) =>
                    setModel({
                      ...model,
                      store: { ...model.store, address: e.target.value }
                    })
                  }
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="المدينة"
                  value={model.city || ""}
                  onChange={(e) => setModel({ ...model, city: e.target.value })}
                />
                <TextField
                  label="التصنيف"
                  value={model.category || ""}
                  onChange={(e) =>
                    setModel({ ...model, category: e.target.value })
                  }
                />
              </Stack>
              <TextField
                label="رابط الشعار"
                value={model.logoUrl || ""}
                onChange={(e) =>
                  setModel({ ...model, logoUrl: e.target.value })
                }
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">تقييم معروض</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={model.rating ?? 0}
                  onChange={(e) =>
                    setModel({ ...model, rating: Number(e.target.value) })
                  }
                  sx={{ width: 120 }}
                />
              </Stack>
            </Stack>
          </Box>
        )}

        {tab === 1 && (
          <Box p={2}>
            <Stack spacing={2} maxWidth={720}>
              {(model.commissions ?? []).map((c, idx) => (
                <Stack
                  key={idx}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <TextField
                    select
                    label="نوع التوصيل"
                    value={c.deliveryType}
                    onChange={(e) => {
                      const next = [...model.commissions];
                      next[idx] = {
                        ...c,
                        deliveryType: e.target.value as "self" | "third-party",
                      };
                      setModel({ ...model, commissions: next });
                    }}
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="self">ذاتي</MenuItem>
                    <MenuItem value="third-party">طرف ثالث</MenuItem>
                  </TextField>
                  <TextField
                    type="number"
                    label="نسبة العمولة %"
                    value={c.commissionRate}
                    onChange={(e) => {
                      const next = [...model.commissions];
                      next[idx] = {
                        ...c,
                        commissionRate: Number(e.target.value),
                      };
                      setModel({ ...model, commissions: next });
                    }}
                    sx={{ minWidth: 180 }}
                  />
                  <TextField
                    type="number"
                    label="رسوم ثابتة"
                    value={c.fixedFee ?? ""}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      const next = [...model.commissions];
                      next[idx] = { ...c, fixedFee: val };
                      setModel({ ...model, commissions: next });
                    }}
                    sx={{ minWidth: 180 }}
                  />
                </Stack>
              ))}
              <Button
                variant="outlined"
                onClick={() =>
                  setModel({
                    ...model,
                    commissions: [
                      ...model.commissions,
                      { deliveryType: "self", commissionRate: 0 },
                    ],
                  })
                }
              >
                إضافة سطر عمولة
              </Button>
              <Alert severity="info">
                تنبيه: تغيير العمولة قد يؤثر على التسعير الجاري.
              </Alert>
            </Stack>
          </Box>
        )}

        {tab === 2 && (
          <Box p={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">طريقة التوصيل</Typography>
              <TextField
                select
                size="small"
                value={model.deliveryType}
                onChange={(e) =>
                  setModel({
                    ...model,
                    deliveryType: e.target.value as "self" | "third-party",
                  })
                }
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="self">ذاتي</MenuItem>
                <MenuItem value="third-party">طرف ثالث</MenuItem>
              </TextField>
              <Switch
                checked={model.isActive}
                onChange={() => {
                  setModel({ ...model, isActive: !model.isActive });
                }}
              />
              <Typography variant="caption" color="text.secondary">
                تفعيل/إيقاف التاجر
              </Typography>
            </Stack>
          </Box>
        )}

        {tab === 3 && (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              مستندات مختصرة (عرض فقط)
            </Typography>
            <Stack spacing={1}>
              {(model.documents ?? []).length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  لا توجد مستندات
                </Typography>
              ) : (
                (model.documents ?? []).map((d) => (
                  <Stack
                    key={d.key}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Chip size="small" label={d.key} />
                    <a href={d.url} target="_blank" rel="noreferrer">
                      رابط
                    </a>
                    <Chip
                      size="small"
                      label={
                        d.status === "valid"
                          ? "صالح"
                          : d.status === "expired"
                          ? "منتهي"
                          : "بانتظار"
                      }
                      color={
                        d.status === "valid"
                          ? "success"
                          : d.status === "expired"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Stack>
                ))
              )}
            </Stack>
          </Box>
        )}

        {tab === 4 && (
          <Box p={2}>
            <BranchesSection
              branches={model.branches ?? []}
              onAdd={onAddBranch}
              onUpdate={onUpdateBranch}
            />
          </Box>
        )}
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.msg}
      />
    </Box>
  );
}

// ========= Branches Section =========
function BranchesSection({
  branches,
  onAdd,
  onUpdate,
}: {
  branches: VendorBranch[];
  onAdd: (b: VendorBranch) => Promise<void>;
  onUpdate: (id: string, patch: Partial<VendorBranch>) => Promise<void>;
}) {
  const list = Array.isArray(branches) ? branches : []; // 👈 حماية إضافية

  const [open, setOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<VendorBranch>({
    name: "",
    address: "",
    city: "",
    lat: 0,
    lng: 0,
    hours: defaultHours(),
    phone: "",
    isActive: true,
  });

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle1">الفروع</Typography>
        <Button
          startIcon={<Add />}
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          إضافة فرع
        </Button>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {list.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          لا توجد فروع
        </Typography>
      ) : (
        <Stack spacing={1}>
          {list.map((b) => (
            <Paper key={b._id || `${b.lat}-${b.lng}`} sx={{ p: 1.5 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {b.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {b.address} • {b.city}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    إحداثيات: {b.lat}, {b.lng}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Map />}
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${b.lat},${b.lng}`,
                        "_blank"
                      )
                    }
                  >
                    خريطة
                  </Button>
                  {b._id && (
                    <Button
                      variant="contained"
                      onClick={() =>
                        void onUpdate(b._id as string, {
                          isActive: !b.isActive,
                        })
                      }
                    >
                      {b.isActive ? "تعطيل" : "تفعيل"}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>إضافة فرع</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="الاسم"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextField
              label="العنوان"
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="المدينة"
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              />
              <TextField
                type="number"
                label="Latitude"
                value={draft.lat}
                onChange={(e) =>
                  setDraft({ ...draft, lat: Number(e.target.value) })
                }
              />
              <TextField
                type="number"
                label="Longitude"
                value={draft.lng}
                onChange={(e) =>
                  setDraft({ ...draft, lng: Number(e.target.value) })
                }
              />
            </Stack>
            <TextField
              label="هاتف الفرع"
              value={draft.phone || ""}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button
            onClick={() => {
              void onAdd(draft);
              setOpen(false);
            }}
            variant="contained"
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function defaultHours(): VendorBranchHours[] {
  const hours: VendorBranchHours[] = [];
  for (
    let d: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;
    d <= 6;
    d = (d + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6
  ) {
    hours.push({ day: d, open: "08:00", close: "23:00", closed: false });
  }
  return hours;
}
