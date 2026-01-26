// src/pages/admin/AdminDriversPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Snackbar,
  Switch,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Block as BlockIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { createDriverSchema, updateDriverSchema, type CreateDriverData, type UpdateDriverData } from "../drivers/schema";
import { TextFieldWithCounter } from "../../components/TextFieldWithCounter";
import StateBoundary from "../../components/ui/StateBoundary";

interface Driver {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "rider_driver" | "light_driver" | "women_driver";
  vehicleType: "bike" | "car" | "motor";
  driverType: "primary" | "joker";
  jokerFrom?: string;
  jokerTo?: string;
  isAvailable: boolean;
  isVerified: boolean;
  isBanned: boolean;
  wallet: { balance: number };
}

export default function AdminDriversPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Create dialog state
  const [createDialog, setCreateDialog] = useState(false);
  const createForm = useForm<CreateDriverData>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      role: "rider_driver",
      vehicleType: "bike",
      driverType: "primary",
      residenceLocation: {
        lat: 0,
        lng: 0,
        address: "غير محدد",
        governorate: "غير محدد",
        city: "غير محدد",
      },
      jokerFrom: new Date().toISOString(),
      jokerTo: new Date(Date.now() + 3600_000).toISOString(),
    },
  });

  // Edit dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editForm = useForm<UpdateDriverData>({
    resolver: zodResolver(updateDriverSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      role: "rider_driver",
      vehicleType: "bike",
      driverType: "primary",
      jokerFrom: new Date().toISOString(),
      jokerTo: new Date(Date.now() + 3600_000).toISOString(),
    },
  });

  // Joker-window dialog state
  const [jokerDialog, setJokerDialog] = useState<{
    open: boolean;
    driverId?: string;
    from: Date;
    to: Date;
  }>({ open: false, from: new Date(), to: new Date() });

  // Fetch drivers
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDrivers([]); // Reset drivers to empty array while loading
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const token = await user.getIdToken(true);
      const response = await axios.get("/admin/drivers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure the response data is an array before setting it
      if (Array.isArray(response?.data)) {
        setDrivers(response.data);
      } else {
        console.error("Expected drivers array but received:", response?.data);
        setError("تنسيق البيانات غير صحيح");
        setDrivers([]);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError("فشل في جلب قائمة الموصلين");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchDrivers();
      else navigate("/login");
    });
    return unsubscribe;
  }, [navigate, fetchDrivers]);

  // Toggle ban
  const toggleBan = async (id: string) => {
    try {
      await axios.patch(`/admin/drivers/${id}/block`);
      setSnackbar({ open: true, message: "تم تغيير حالة الحظر" });
      fetchDrivers();
    } catch {
      setSnackbar({ open: true, message: "فشل في تغيير حالة الحظر" });
    }
  };

  // Open create dialog
  const openCreate = () => {
    createForm.reset({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      role: "rider_driver",
      vehicleType: "bike",
      driverType: "primary",
      residenceLocation: {
        lat: 0,
        lng: 0,
        address: "غير محدد",
        governorate: "غير محدد",
        city: "غير محدد",
      },
      jokerFrom: new Date().toISOString(),
      jokerTo: new Date(Date.now() + 3600_000).toISOString(),
    });
    setCreateDialog(true);
  };

  const closeCreate = () => setCreateDialog(false);

  // Save new driver
  const saveNew = async (data: CreateDriverData) => {
    try {
      await axios.post("/admin/drivers", data);
      setSnackbar({ open: true, message: "تم إنشاء الموصل بنجاح" });
      closeCreate();
      fetchDrivers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "فشل في إنشاء الموصل";
      setSnackbar({ open: true, message });
    }
  };

  // Handle form submission
  const onSubmitCreate = createForm.handleSubmit(saveNew);

  // Open edit dialog
  const openEditDialog = (d: Driver) => {
    setEditingId(d._id);
    editForm.reset({
      fullName: d.fullName,
      phone: d.phone,
      email: d.email,
      role: d.role,
      vehicleType: d.vehicleType,
      driverType: d.driverType,
      jokerFrom: d.jokerFrom || new Date().toISOString(),
      jokerTo: d.jokerTo || new Date(Date.now() + 3600_000).toISOString(),
    });
    setEditDialog(true);
  };

  const closeEditDialog = () => setEditDialog(false);

  // Save edits
  const saveEdit = async (data: UpdateDriverData) => {
    if (!editingId) return;
    try {
      await axios.patch(`/admin/drivers/${editingId}`, data);
      setSnackbar({ open: true, message: "تم تحديث بيانات الموصل" });
      closeEditDialog();
      fetchDrivers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "فشل في تحديث الموصل";
      setSnackbar({ open: true, message });
    }
  };

  // Handle form submission for edit
  const onSubmitEdit = editForm.handleSubmit(saveEdit);

  // Open joker-window dialog

  const closeJoker = () => setJokerDialog((j) => ({ ...j, open: false }));

  // Save joker window
  const saveJoker = async () => {
    try {
      await axios.patch(`/admin/drivers/${jokerDialog.driverId}/joker-window`, {
        jokerFrom: jokerDialog.from.toISOString(),
        jokerTo: jokerDialog.to.toISOString(),
      });
      setSnackbar({ open: true, message: "تم تحديث نافذة الجوكر" });
      closeJoker();
      fetchDrivers();
    } catch {
      setSnackbar({ open: true, message: "فشل في تحديث النافذة" });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5">لوحة تحكم الموصلين</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={openCreate}
          >
            جديد
          </Button>
        </Box>

        <StateBoundary
          isLoading={loading}
          isError={!!error}
          isEmpty={drivers.length === 0 && !loading && !error}
          onRetry={fetchDrivers}
          emptyTitle="لا يوجد موصلين"
          emptyDescription="لا توجد موصلين مسجلين في النظام حالياً"
          emptyActionLabel="إنشاء موصل جديد"
          emptyOnAction={openCreate}
          errorMessage={error || undefined}
          loadingMessage="جارٍ تحميل قائمة الموصلين..."
        >
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>الهاتف</TableCell>
                  <TableCell>الدور</TableCell>
                  <TableCell>مركبة</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell>متوفر</TableCell>
                  <TableCell>موثق</TableCell>
                  <TableCell>محظور</TableCell>
                  <TableCell>محفظة</TableCell>
                  <TableCell>نافذة الجوكر</TableCell>
                  <TableCell align="right">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell>
                      <Button
                        onClick={() => navigate(`/admin/drivers/${d._id}`)}
                      >
                        {d.fullName}
                      </Button>
                    </TableCell>
                    <TableCell>{d.phone || "—"}</TableCell>
                    <TableCell>{(d.role || "").replace("_", " ")}</TableCell>
                    <TableCell>{d.vehicleType || "—"}</TableCell>
                    <TableCell>
                      {d.driverType === "joker" ? "جوكر" : "أساسي"}
                    </TableCell>
                    <TableCell>
                      <Switch checked={d.isAvailable || false} disabled />
                    </TableCell>
                    <TableCell>
                      <Switch checked={d.isVerified || false} disabled />
                    </TableCell>
                    <TableCell>
                      <Switch checked={d.isBanned || false} disabled />
                    </TableCell>
                    <TableCell>
                      {(d.wallet?.balance || 0).toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      {d.driverType === "joker" ? (
                        <Button
                          size="small"
                          onClick={() =>
                            setJokerDialog({
                              open: true,
                              driverId: d._id,
                              from: new Date(d.jokerFrom || new Date()),
                              to: new Date(d.jokerTo || new Date()),
                            })
                          }
                        >
                          {d.jokerFrom && d.jokerTo ? (
                            <>
                              {new Date(d.jokerFrom).toLocaleString()} -{" "}
                              {new Date(d.jokerTo).toLocaleString()}
                            </>
                          ) : (
                            "غير محدد"
                          )}
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="تعديل">
                        <IconButton onClick={() => openEditDialog(d)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حظر/رفع حظر">
                        <IconButton onClick={() => toggleBan(d._id)}>
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </StateBoundary>

        <Dialog
          open={createDialog}
          onClose={closeCreate}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>إنشاء موصل جديد</DialogTitle>
          <form onSubmit={onSubmitCreate}>
            <DialogContent>
              <Stack spacing={2} mt={1}>
                <TextFieldWithCounter
                  label="الاسم"
                  fullWidth
                  maxLength={100}
                  {...createForm.register("fullName")}
                  error={!!createForm.formState.errors.fullName}
                  helperText={createForm.formState.errors.fullName?.message}
                />
                <TextField
                  label="الهاتف"
                  fullWidth
                  {...createForm.register("phone")}
                  error={!!createForm.formState.errors.phone}
                  helperText={createForm.formState.errors.phone?.message}
                />
                <TextField
                  label="البريد الإلكتروني"
                  fullWidth
                  {...createForm.register("email")}
                  error={!!createForm.formState.errors.email}
                  helperText={createForm.formState.errors.email?.message}
                />
                <TextField
                  label="كلمة المرور"
                  type="password"
                  fullWidth
                  {...createForm.register("password")}
                  error={!!createForm.formState.errors.password}
                  helperText={createForm.formState.errors.password?.message || "حد أدنى 8 أحرف + حروف كبيرة وصغيرة ورقم"}
                />
                <TextField
                  select
                  label="الدور"
                  fullWidth
                  {...createForm.register("role")}
                  error={!!createForm.formState.errors.role}
                  helperText={createForm.formState.errors.role?.message}
                >
                  <MenuItem value="rider_driver">توصيل</MenuItem>
                  <MenuItem value="light_driver">Light</MenuItem>
                  <MenuItem value="women_driver">Women</MenuItem>
                </TextField>
                <TextField
                  select
                  label="المركبة"
                  fullWidth
                  {...createForm.register("vehicleType")}
                  error={!!createForm.formState.errors.vehicleType}
                  helperText={createForm.formState.errors.vehicleType?.message}
                >
                  <MenuItem value="motor">متر</MenuItem>
                  <MenuItem value="bike">دراجة</MenuItem>
                  <MenuItem value="car">سيارة</MenuItem>
                </TextField>
                <TextField
                  select
                  label="نوع الموصل"
                  fullWidth
                  {...createForm.register("driverType")}
                  error={!!createForm.formState.errors.driverType}
                  helperText={createForm.formState.errors.driverType?.message}
                >
                  <MenuItem value="primary">أساسي</MenuItem>
                  <MenuItem value="joker">جوكر</MenuItem>
                </TextField>
                {createForm.watch("driverType") === "joker" && (
                  <>
                    <DateTimePicker
                      label="بداية الجوكر"
                      value={dayjs(createForm.watch("jokerFrom"))}
                      onChange={(dt: Dayjs | null) => {
                        if (dt) {
                          createForm.setValue("jokerFrom", dt.toISOString());
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!createForm.formState.errors.jokerFrom,
                          helperText: createForm.formState.errors.jokerFrom?.message,
                        }
                      }}
                    />
                    <DateTimePicker
                      label="نهاية الجوكر"
                      value={dayjs(createForm.watch("jokerTo"))}
                      onChange={(dt: Dayjs | null) => {
                        if (dt) {
                          createForm.setValue("jokerTo", dt.toISOString());
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!createForm.formState.errors.jokerTo,
                          helperText: createForm.formState.errors.jokerTo?.message,
                        }
                      }}
                    />
                  </>
                )}

                {/* رسائل خطأ عامة */}
                {createForm.formState.errors.root && (
                  <Alert severity="error">
                    {createForm.formState.errors.root.message}
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeCreate}>إلغاء</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createForm.formState.isSubmitting}
              >
                {createForm.formState.isSubmitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={editDialog}
          onClose={closeEditDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>تعديل بيانات الموصل</DialogTitle>
          <form onSubmit={onSubmitEdit}>
            <DialogContent>
              <Stack spacing={2} mt={1}>
                <TextFieldWithCounter
                  label="الاسم"
                  fullWidth
                  maxLength={100}
                  {...editForm.register("fullName")}
                  error={!!editForm.formState.errors.fullName}
                  helperText={editForm.formState.errors.fullName?.message}
                />
                <TextField
                  label="الهاتف"
                  fullWidth
                  {...editForm.register("phone")}
                  error={!!editForm.formState.errors.phone}
                  helperText={editForm.formState.errors.phone?.message}
                />
                <TextField
                  label="البريد الإلكتروني"
                  fullWidth
                  {...editForm.register("email")}
                  error={!!editForm.formState.errors.email}
                  helperText={editForm.formState.errors.email?.message}
                />
                <TextField
                  select
                  label="الدور"
                  fullWidth
                  {...editForm.register("role")}
                  error={!!editForm.formState.errors.role}
                  helperText={editForm.formState.errors.role?.message}
                >
                  <MenuItem value="rider_driver">توصيل</MenuItem>
                  <MenuItem value="light_driver">Light</MenuItem>
                  <MenuItem value="women_driver">Women</MenuItem>
                </TextField>
                <TextField
                  select
                  label="المركبة"
                  fullWidth
                  {...editForm.register("vehicleType")}
                  error={!!editForm.formState.errors.vehicleType}
                  helperText={editForm.formState.errors.vehicleType?.message}
                >
                  <MenuItem value="motor">متر</MenuItem>
                  <MenuItem value="bike">دراجة</MenuItem>
                  <MenuItem value="car">سيارة</MenuItem>
                </TextField>
                <TextField
                  select
                  label="نوع الموصل"
                  fullWidth
                  {...editForm.register("driverType")}
                  error={!!editForm.formState.errors.driverType}
                  helperText={editForm.formState.errors.driverType?.message}
                >
                  <MenuItem value="primary">أساسي</MenuItem>
                  <MenuItem value="joker">جوكر</MenuItem>
                </TextField>
                {editForm.watch("driverType") === "joker" && (
                  <>
                    <DateTimePicker
                      label="بداية الجوكر"
                      value={dayjs(editForm.watch("jokerFrom"))}
                      onChange={(dt: Dayjs | null) => {
                        if (dt) {
                          editForm.setValue("jokerFrom", dt.toISOString());
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!editForm.formState.errors.jokerFrom,
                          helperText: editForm.formState.errors.jokerFrom?.message,
                        }
                      }}
                    />
                    <DateTimePicker
                      label="نهاية الجوكر"
                      value={dayjs(editForm.watch("jokerTo"))}
                      onChange={(dt: Dayjs | null) => {
                        if (dt) {
                          editForm.setValue("jokerTo", dt.toISOString());
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!editForm.formState.errors.jokerTo,
                          helperText: editForm.formState.errors.jokerTo?.message,
                        }
                      }}
                    />
                  </>
                )}

                {/* رسائل خطأ عامة */}
                {editForm.formState.errors.root && (
                  <Alert severity="error">
                    {editForm.formState.errors.root.message}
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeEditDialog}>إلغاء</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={editForm.formState.isSubmitting}
              >
                {editForm.formState.isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={jokerDialog.open}
          onClose={closeJoker}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>تعديل نافذة الجوكر</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <DateTimePicker
                label="بداية"
                value={dayjs(jokerDialog.from)}
                onChange={(dt: Dayjs | null) => {
                  if (dt) setJokerDialog((j) => ({ ...j, from: dt.toDate() }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="نهاية"
                value={dayjs(jokerDialog.to)}
                onChange={(dt: Dayjs | null) => {
                  if (dt) setJokerDialog((j) => ({ ...j, to: dt.toDate() }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeJoker}>إلغاء</Button>
            <Button variant="contained" onClick={saveJoker}>
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
    </LocalizationProvider>
  );
}
