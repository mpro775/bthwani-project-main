// src/pages/admin/UsersListPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Stack,
  DialogActions,
  MenuItem,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Person as UserIcon,
  CheckCircle as ActiveIcon,
  Block as BlockedIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "../../utils/axios";
import { useListQueryState } from "../../hook/useQueryState";
import { getEnumLabel, getEnumBadge } from "../../constants/statusMap";
import { createAdmin, updateAdmin, deleteAdmin} from "../../api/adminUsers";
import { useSnackbar } from "notistack";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function UsersListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // استخدم hook لحفظ حالة الفلاتر والصفحات في QueryString
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
  
  } = useListQueryState();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // فورم إنشاء مستخدم جديد
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roles: ['user'] as string[],
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/admin/users/list", {
        params: {
          q: search || undefined,
          page: page,
          per_page: perPage,
          // يمكن إضافة فلاتر أخرى هنا
        },
      });

      // الرد الجديد يحتوي على users و pagination
      if (response?.data?.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setTotal(response.data.pagination?.total || 0);
      } else if (Array.isArray(response?.data)) {
        // fallback للشكل القديم
        setUsers(response.data);
        setTotal(response.data.length);
      } else {
        console.error('Expected an array of users but received:', response.data);
        setUsers([]);
        setError("تنسيق بيانات غير صحيح من الخادم");
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError("فشل في تحميل المستخدمين");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, perPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // دوال CRUD
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      await createAdmin({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        roles: newUser.roles,
      });
      enqueueSnackbar('تم إنشاء المستخدم بنجاح', { variant: 'success' });
      setCreateDialog(false);
      setNewUser({ name: '', email: '', password: '', roles: ['user'] });
      fetchUsers();
    } catch  {
      enqueueSnackbar('فشل في إنشاء المستخدم', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await updateAdmin(selectedUser._id, {
        name: selectedUser.fullName,
        email: selectedUser.email,
        roles: [selectedUser.role],
        isActive: selectedUser.isActive,
      });
      enqueueSnackbar('تم تحديث المستخدم بنجاح', { variant: 'success' });
      setEditDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch  {
      enqueueSnackbar('فشل في تحديث المستخدم', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      setLoading(true);
      await deleteAdmin(userId);
      enqueueSnackbar('تم حذف المستخدم بنجاح', { variant: 'success' });
      fetchUsers();
    } catch  {
      enqueueSnackbar('فشل في حذف المستخدم', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialog(true);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // العودة للصفحة الأولى عند البحث
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage + 1); // تحويل من 0-based إلى 1-based
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(1); // العودة للصفحة الأولى عند تغيير عدد العناصر
  };

  const handleViewUser = (userId: string) => {
    // حفظ الحالة الحالية في QueryString قبل الانتقال للتفاصيل
    const currentParams = new URLSearchParams(location.search);
    navigate(`/admin/users/${userId}?${currentParams.toString()}`);
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* رأس الصفحة */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          إدارة المستخدمين العاديين
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UserIcon />}
            onClick={() => setCreateDialog(true)}
          >
            إضافة مستخدم
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            disabled={loading}
          >
            تحديث
          </Button>
        </Stack>
      </Box>

      {/* شريط البحث */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="بحث"
          size="small"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Box>

      {/* رسائل الخطأ */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* مؤشر التحميل */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* جدول المستخدمين */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "common.white" }}>الاسم</TableCell>
                <TableCell sx={{ color: "common.white" }}>البريد الإلكتروني</TableCell>
                <TableCell sx={{ color: "common.white" }}>الهاتف</TableCell>
                <TableCell sx={{ color: "common.white" }}>الدور</TableCell>
                <TableCell sx={{ color: "common.white" }}>الحالة</TableCell>
                <TableCell sx={{ color: "common.white" }}>التحقق</TableCell>
                <TableCell sx={{ color: "common.white" }}>التاريخ</TableCell>
                <TableCell align="center" sx={{ color: "common.white" }}>
                  إجراءات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      لا توجد مستخدمين متاحين
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={getEnumLabel("user_role", user.role)}
                        color={getEnumBadge("user_role", user.role).replace('danger', 'error') as 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'}
                        size="small"
                        icon={<UserIcon fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? "نشط" : "معطل"}
                        color={user.isActive ? "success" : "error"}
                        size="small"
                        icon={user.isActive ? <ActiveIcon fontSize="small" /> : <BlockedIcon fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isVerified ? "موثق" : "غير موثق"}
                        color={user.isVerified ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewUser(user._id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton
                          color="secondary"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
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

        {/* التصفح */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={perPage}
          page={page - 1} // تحويل من 1-based إلى 0-based
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} من ${count}`
          }
        />
      </Paper>

      {/* حوار إنشاء مستخدم جديد */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="الاسم"
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="البريد الإلكتروني"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label="كلمة المرور"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={loading || !newUser.name || !newUser.email || !newUser.password}
          >
            إنشاء
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار تعديل مستخدم */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل المستخدم</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="الاسم"
                fullWidth
                value={selectedUser.fullName}
                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, fullName: e.target.value } : null)}
              />
              <TextField
                label="البريد الإلكتروني"
                type="email"
                fullWidth
                value={selectedUser.email}
                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
              />
              <TextField
                select
                label="الدور"
                fullWidth
                value={selectedUser.role}
                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role: e.target.value } : null)}
              >
                <MenuItem value="user">مستخدم</MenuItem>
                <MenuItem value="admin">أدمن</MenuItem>
                <MenuItem value="superadmin">سوبر أدمن</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedUser.isActive}
                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                  />
                }
                label="نشط"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={loading || !selectedUser}
          >
            حفظ التعديلات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
