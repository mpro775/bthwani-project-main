import  { useEffect, useState, useCallback } from "react";
import type {
  AdminStatus,
  AdminRole,
  AdminListItem,

} from "./types";
import { useAdminUser } from '../../../hook/useAdminUser';
import { useCanWriteAdmins, useCanReadAdmins } from '../../../hook/useCapabilities';
import {
  apiListAdmins,
  apiPatchAdminStatus,

} from "./api";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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
} from "@mui/material";
import {
  Add,
  Edit,
  Refresh,
  Search,
  Security,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export function AdminsListPage({ currentUserId }: { currentUserId?: string }) {
  // currentUserId reserved for future use (admin self-management features)
  void currentUserId;

  // فلاتر البحث
  const [role, setRole] = useState<AdminRole | "">("");
  const [status, setStatus] = useState<AdminStatus | "">("");
  const [q, setQ] = useState<string>("");

  // حالة الجدول
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [rows, setRows] = useState<AdminListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // متغيرات إضافية للمستقبل
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // navigation
  const navigate = useNavigate();

  // حالة المستخدم والصلاحيات
  const { user, loading: userLoading } = useAdminUser();
  const canReadAdmins = useCanReadAdmins(user);
  const canWriteAdmins = useCanWriteAdmins(user);
  // const canEditAdmins = useCanEditAdmins(user);
  // const canDeleteAdmins = useCanDeleteAdmins(user);

  // دالة تحميل البيانات
  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiListAdmins({
        page: page + 1,
        pageSize,
        role: role || undefined,
        status: status || undefined,
        q: q || undefined,
      });
      // Ensure we always set an array, even if API returns undefined
      setRows(Array.isArray(res.data) ? res.data : []);
      setTotal(typeof res.total === 'number' ? res.total : 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "تعذر جلب المسؤولين");
      // Reset to empty state on error
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, role, status, q]);

  // تحميل البيانات عند تغيير الفلاتر أو الصفحة
  useEffect(() => {
    void load();
  }, [role, status, page, pageSize, refreshTrigger, load]);

  // دالة إعادة تحميل البيانات - مربوطة بزر التحديث
  const refresh = (): void => {
    setRefreshTrigger(prev => prev + 1);
  };

  // دالة التعديل - تنقل إلى صفحة تفاصيل المشرف
  const onEdit = (id: string): void => {
    navigate(`/admin/admins/${id}`);
  };

  // لو user لسه يتحمل، لا تعرض المحتوى
  if (userLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // لو ما عنده صلاحية قراءة، لا تعرض المحتوى (سيتم التعامل معه في RequireAdminPermission)
  if (!canReadAdmins) {
    return null;
  }

  return (
    <Box p={2}>
      {/* العنوان والزر الرئيسي */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">إدارة المسؤولين</Typography>
        {/* زر إنشاء المشرفين تم نقله إلى مكون منفصل */}
        {(canReadAdmins || canWriteAdmins) && (
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => navigate('/admin/admins/new')}
          >
            مسؤول جديد
          </Button>
        )}
      </Stack>

      {/* فلاتر البحث */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            size="small"
            placeholder="بحث بالاسم/البريد"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
              label="الدور"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole | "")}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="superadmin">SuperAdmin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="support">Support</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="الحالة"
              value={status}
              onChange={(e) => setStatus(e.target.value as AdminStatus | "")}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="disabled">معطّل</MenuItem>
            </TextField>

            <Button
              variant="text"
              onClick={() => {
                setRole("");
                setStatus("");
                setQ("");
                setPage(0);
              }}
            >
              مسح الفلاتر
            </Button>
            <Tooltip title="تحديث">
              <IconButton onClick={refresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* جدول المشرفين */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>البريد</TableCell>
                <TableCell>الدور</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>آخر دخول</TableCell>
                <TableCell align="center">عدد الصلاحيات</TableCell>
                <TableCell align="right">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : (rows || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box py={6} textAlign="center">
                      لا توجد نتائج
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                (rows || []).map((admin) => (
                  <TableRow key={admin._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar>
                          <Security />
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {admin.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={admin.status === "active" ? "نشط" : "معطّل"}
                        color={admin.status === "active" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell align="center">{admin.capsCount}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        {canReadAdmins && (
                          <Tooltip title="تعديل">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(admin._id)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canWriteAdmins && (
                          <Tooltip
                            title={admin.status === "active" ? "تعطيل" : "تفعيل"}
                          >
                            <IconButton
                              size="small"
                              onClick={async () => {
                                try {
                                  const next =
                                    admin.status === "active"
                                      ? "disabled"
                                      : "active";
                                  await apiPatchAdminStatus(admin._id, next);
                                  setRows((prev) =>
                                    prev.map((r) =>
                                      r._id === admin._id
                                        ? { ...r, status: next }
                                        : r
                                    )
                                  );
                                } catch (e: unknown) {
                                  alert(
                                    e instanceof Error
                                      ? e.message
                                      : "فشل تغيير الحالة"
                                  );
                                }
                              }}
                            >
                              {admin.status === "active" ? <Lock /> : <LockOpen />}
                            </IconButton>
                          </Tooltip>
                        )}
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
          count={total || 0}
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

      {/* رسائل الخطأ */}
      {error && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setError(null)}
          message={error}
        />
      )}
    </Box>
  );
}
