import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AdminStatus,
  AdminUser,
  ModuleDefinition,
  CreateAdminPayload,
} from "./types";
import { useCapabilities } from "./CapabilitiesHooks";
import { toFlatCaps, fromFlatCaps } from "./utils";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import RoleMatrix from "./RoleMatrix";
import {
  apiCreateAdmin,
  apiGetAdmin,
  apiPatchAdmin,
  apiGetModules,
} from "./api";
import {
  createAdminSchema,
  updateAdminSchema,
  type CreateAdminData,
  type UpdateAdminData,
} from "./schema";
import { TextFieldWithCounter } from "../../../components/TextFieldWithCounter";

/**
 * AdminUpsertDrawer - Drawer لإنشاء وتعديل المشرفين
 * يتضمن نموذج كامل للبيانات والصلاحيات
 */
export function AdminUpsertDrawer({
  open,
  id,
  onClose,
  onCreated,
  onUpdated,
  currentUserId,
}: {
  open: boolean;
  id: string | null;
  onClose: () => void;
  onCreated: () => void;
  onUpdated: (u: AdminUser) => void;
  currentUserId?: string;
}) {
  const { setCapabilities } = useCapabilities();

  // تحديد وضع التشغيل (إنشاء أم تعديل)
  const creating = !id;

  // حالة التحميل والحفظ
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(creating);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // بيانات النموذج
  const [status, setStatus] = useState<AdminStatus>("active");
  const [flatCaps, setFlatCaps] = useState<string[]>([]);

  // دالة تحميل البيانات والوحدات
  const load = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [mods, user] = await Promise.all([
        apiGetModules(),
        id
          ? apiGetAdmin(id)
          : Promise.resolve({ data: undefined as unknown as AdminUser }),
      ]);

      setModules(mods.data);

      if (user.data) {
        const admin = user.data;
        adminForm.reset({
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        });
        setFlatCaps(toFlatCaps(admin.capabilities));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند فتح الـ drawer
  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  // إنشاء فورم باستخدام react-hook-form
  const adminForm = useForm<CreateAdminData | UpdateAdminData>({
    resolver: zodResolver(creating ? createAdminSchema : updateAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
      capabilities: [],
      ...(creating ? {} : { status: "active" }),
    },
  });

  // دالة الحفظ المحدثة
  const onSave = async (
    data: CreateAdminData | UpdateAdminData
  ): Promise<void> => {
    try {
      setSaving(true);
      setError(null);

      if (creating) {
        const createData = data as CreateAdminData;
        const payload: CreateAdminPayload = {
          name: createData.name,
          email: createData.email,
          password: createData.password as string,
          role: createData.role,
          capabilities: flatCaps,
        };

        await apiCreateAdmin(payload);
        onCreated();
        onClose();
      } else if (id) {
        // تحديث المشرف الموجود
        const updateData = data as UpdateAdminData;
        const patch = await apiPatchAdmin(id, {
          name: updateData.name,
          email: updateData.email,
          role: updateData.role,
          status: updateData.status as "active" | "disabled",
          capabilities: fromFlatCaps(flatCaps) as unknown as string[],
        });

        const updated = patch.data;
        onUpdated(updated);

        // تحديث صلاحيات المشرف الحالي إذا كان يعدل نفسه
        if (currentUserId && updated._id === currentUserId) {
          setCapabilities(toFlatCaps(updated.capabilities) as string[]);
        }

        onClose();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission
  const onSubmit = adminForm.handleSubmit(onSave);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 560 } } }}
    >
      <Box p={2}>
        {/* العنوان والزر الخاص بالإغلاق */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="h6">
            {creating ? "إنشاء مسؤول جديد" : "تعديل المسؤول"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>

        {/* حالة التحميل */}
        {loading ? (
          <Box py={6} textAlign="center">
            <CircularProgress size={22} />
          </Box>
        ) : (
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              {/* رسائل الخطأ */}
              {error && <Alert severity="error">{error}</Alert>}

              {/* بيانات المشرف الأساسية */}
              <TextFieldWithCounter
                label="الاسم"
                fullWidth
                maxLength={100}
                {...adminForm.register("name")}
                error={!!adminForm.formState.errors.name}
                helperText={adminForm.formState.errors.name?.message}
              />

              <TextField
                type="email"
                label="البريد الإلكتروني"
                fullWidth
                {...adminForm.register("email")}
                error={!!adminForm.formState.errors.email}
                helperText={adminForm.formState.errors.email?.message}
              />

              {/* كلمة المرور (للإنشاء فقط) */}
              {creating && (
                <TextField
                  type="password"
                  label="كلمة المرور"
                  fullWidth
                  {...adminForm.register("password")}
                  error={
                    !!(
                      adminForm.formState.errors as unknown as {
                        password?: { message?: string };
                      }
                    ).password
                  }
                  helperText={
                    (
                      adminForm.formState.errors as unknown as {
                        password?: { message?: string };
                      }
                    ).password?.message ||
                    "حد أدنى 8 أحرف + حروف كبيرة وصغيرة ورقم"
                  }
                />
              )}

              {/* الدور والحالة */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="الدور"
                  sx={{ minWidth: 200 }}
                  {...adminForm.register("role")}
                  error={!!adminForm.formState.errors.role}
                  helperText={adminForm.formState.errors.role?.message}
                >
                  <MenuItem value="superadmin">SuperAdmin</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                </TextField>

                <FormControlLabel
                  control={
                    <Switch
                      checked={status === "active"}
                      onChange={(e) =>
                        setStatus(e.target.checked ? "active" : "disabled")
                      }
                    />
                  }
                  label={status === "active" ? "نشط" : "معطّل"}
                />
              </Stack>

              {/* فاصل */}
              <Divider />

              {/* عنوان قسم الصلاحيات */}
              <Typography variant="subtitle1" fontWeight="bold">
                الصلاحيات والوحدات
              </Typography>

              {/* مصفوفة الصلاحيات */}
              <RoleMatrix
                modules={modules}
                value={flatCaps}
                onChange={setFlatCaps}
              />

              {/* رسائل خطأ عامة */}
              {adminForm.formState.errors.root && (
                <Alert severity="error">
                  {adminForm.formState.errors.root.message}
                </Alert>
              )}

              {/* أزرار الحفظ والإلغاء */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={onClose}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving || adminForm.formState.isSubmitting}
                >
                  {saving || adminForm.formState.isSubmitting
                    ? "جاري الحفظ..."
                    : "حفظ"}
                </Button>
              </Stack>
            </Stack>
          </form>
        )}
      </Box>
    </Drawer>
  );
}
