// src/pages/admin/UserManagement.tsx
import { useEffect, useState } from "react";
import axios from "../../utils/axios"; // your axios instance with interceptor
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
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Star as SuperAdminIcon,
  CheckCircle as ActiveIcon,
  Block as BlockedIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import type { AdminRole, ModuleName, ModulePermissions } from "../../type/admin";
import { adminRoles, moduleNames } from "./adminConstants";
type Role = "user" | "admin" | "superadmin";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
}

// constants moved to adminConstants.ts to preserve fast-refresh behavior

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<Role | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // استخدم الروت الجديد للمستخدمين العاديين (ليس المشرفين فقط)
      const res = await axios.get("/admin/users/list", {
        params: {
          q: searchTerm || undefined,
          page: page + 1, // API يبدأ من 1 وليس 0
          per_page: rowsPerPage,
          // filters إضافية
        },
      });

      // الرد الجديد يحتوي على users و pagination
      if (res?.data?.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else if (Array.isArray(res?.data)) {
        // fallback للشكل القديم
        setUsers(res.data);
      } else {
        console.error('Expected an array of users but received:', res.data);
        setUsers([]);
        setError("تنسيق بيانات غير صحيح من الخادم");
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError("فشل في تحميل المستخدمين");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  // داخل الـ component
  const defaultPermissions: Partial<Record<ModuleName, ModulePermissions>> =
    moduleNames.reduce((acc, mod) => {
      acc[mod.value] = {
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
        export: false,
      };
      return acc;
    }, {} as Partial<Record<ModuleName, ModulePermissions>>);

  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    roles: AdminRole[];
    permissions: Partial<Record<ModuleName, ModulePermissions>>;
  }>({
    username: "",
    password: "",
    roles: ["admin"],
    permissions: defaultPermissions,
  });

  const handleRoleChange = async (id: string, newRole: Role) => {
    setLoading(true);
    try {
      await axios.patch<unknown>(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
      setSnackbar({ open: true, message: "تم تغيير الدور بنجاح" });
    } catch {
      setError("فشل في تغيير الدور");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      await axios.patch<unknown>(`/admin/users/${id}`, {
        isBlocked: !currentStatus,
      });
      fetchUsers();
      setSnackbar({
        open: true,
        message: `تم ${!currentStatus ? "تفعيل" : "تعطيل"} المستخدم`,
      });
    } catch {
      setError("فشل في تغيير الحالة");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filteredUsers = Array.isArray(users) ? users.filter((u) =>
    [u.fullName, u.email, u.phone].some((field) =>
      field && field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  const handleCloseSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  // إضافة مستخدم جديد
  const handleAddUser = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/admin/users", newUser);
      setSnackbar({ open: true, message: "تم إضافة المستخدم بنجاح" });
      setOpenAddDialog(false);
      // إعادة ضبط الحقول
      setNewUser({
        username: "",
        password: "",
        roles: ["admin"],
        permissions: defaultPermissions,
      });
      fetchUsers();
    } catch {
      setError("فشل في إضافة المستخدم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
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
          إدارة المستخدمين
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="success"
            sx={{ mr: 2 }}
            onClick={() => setOpenAddDialog(true)}
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
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="بحث"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            endAdornment: searchTerm && (
              <IconButton onClick={() => setSearchTerm("")} size="small">
                <MoreIcon sx={{ transform: "rotate(45deg)" }} />
              </IconButton>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>تصفية حسب الدور</InputLabel>
          <Select
            value={filter}
            label="تصفية حسب الدور"
            onChange={(e) => setFilter(e.target.value as Role | "")}
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="user">مستخدم</MenuItem>
            <MenuItem value="admin">أدمن</MenuItem>
            <MenuItem value="superadmin">سوبر أدمن</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>البريد</TableCell>
                  <TableCell>الهاتف</TableCell>
                  <TableCell>الدور</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell align="center">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.role === "superadmin"
                              ? "سوبر أدمن"
                              : user.role === "admin"
                              ? "أدمن"
                              : "مستخدم"
                          }
                          color={
                            user.role === "superadmin"
                              ? "secondary"
                              : user.role === "admin"
                              ? "primary"
                              : "default"
                          }
                          size="small"
                          icon={
                            user.role === "superadmin" ? (
                              <SuperAdminIcon fontSize="small" />
                            ) : user.role === "admin" ? (
                              <AdminIcon fontSize="small" />
                            ) : (
                              <UserIcon fontSize="small" />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? "نشط" : "معطل"}
                          color={user.isActive ? "success" : "error"}
                          size="small"
                          icon={
                            user.isActive ? (
                              <ActiveIcon fontSize="small" />
                            ) : (
                              <BlockedIcon fontSize="small" />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={
                            user.role !== "admin"
                              ? "ترقية إلى أدمن"
                              : "تنزيل إلى مستخدم"
                          }
                        >
                          <IconButton
                            onClick={() =>
                              handleRoleChange(
                                user._id,
                                user.role === "admin" ? "user" : "admin"
                              )
                            }
                            disabled={loading || user.role === "superadmin"}
                          >
                            {user.role !== "admin" ? (
                              <AdminIcon />
                            ) : (
                              <UserIcon />
                            )}
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            user.isActive ? "تعطيل الحساب" : "تفعيل الحساب"
                          }
                        >
                          <IconButton
                            onClick={() =>
                              handleStatusToggle(user._id, user.isActive)
                            }
                            disabled={loading}
                          >
                            {user.isActive ? <BlockedIcon /> : <ActiveIcon />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="مزيد من التفاصيل">
                          <IconButton
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد الصفوف:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} من ${count}`
            }
          />
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>تفاصيل المستخدم</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ minWidth: 300 }}>
              <Typography>
                <strong>الاسم:</strong> {selectedUser.fullName}
              </Typography>
              <Typography>
                <strong>البريد:</strong> {selectedUser.email}
              </Typography>
              <Typography>
                <strong>الهاتف:</strong> {selectedUser.phone}
              </Typography>
              <Typography>
                <strong>الدور:</strong> {selectedUser.role}
              </Typography>
              <Typography>
                <strong>الحالة:</strong>{" "}
                {selectedUser.isActive ? "نشط" : "معطل"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog لإضافة مستخدم جديد */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          <TextField
            label="اسم المستخدم"
            value={newUser.username}
            onChange={(e) =>
              setNewUser((u) => ({ ...u, username: e.target.value }))
            }
            fullWidth
            sx={{ my: 1 }}
          />
          <TextField
            label="كلمة المرور"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser((u) => ({ ...u, password: e.target.value }))
            }
            fullWidth
            sx={{ my: 1 }}
          />
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel>الدور</InputLabel>
            <Select
              value={newUser.roles[0]}
              label="الدور"
              onChange={(e) =>
                setNewUser((u) => ({
                  ...u,
                  roles: [e.target.value as AdminRole],
                }))
              }
            >
              {adminRoles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* يمكنك هنا إضافة اختيار الصلاحيات لكل قسم ModuleName حسب الحاجة */}
          {/* مثال مبسط لصلاحية واحدة فقط */}
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel>القسم</InputLabel>
            <Select
              value={Object.keys(newUser.permissions)[0] || ""}
              label="القسم"
              onChange={(e) =>
                setNewUser((u) => ({
                  ...u,
                  permissions: {
                    [e.target.value as ModuleName]: { view: true },
                  },
                }))
              }
            >
              {moduleNames.map((mod) => (
                <MenuItem key={mod.value} value={mod.value}>
                  {mod.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
            صلاحيات الأقسام
          </Typography>
          {moduleNames.map((mod) => (
            <Box
              key={mod.value}
              sx={{ mb: 1, borderBottom: 1, borderColor: "divider", pb: 1 }}
            >
              <Typography>{mod.label}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(
                  [
                    "view",
                    "create",
                    "edit",
                    "delete",
                    "approve",
                    "export",
                  ] as const
                ).map((perm) => (
                  <FormControlLabel
                    key={perm}
                    control={
                      <Checkbox
                        size="small"
                        checked={!!newUser.permissions[mod.value]?.[perm]}
                        onChange={(e) => {
                          const updated = {
                            ...newUser.permissions,
                            [mod.value]: {
                              ...newUser.permissions[mod.value],
                              [perm]: e.target.checked,
                            },
                          };
                          setNewUser((u) => ({ ...u, permissions: updated }));
                        }}
                      />
                    }
                    label={perm}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={loading}
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
