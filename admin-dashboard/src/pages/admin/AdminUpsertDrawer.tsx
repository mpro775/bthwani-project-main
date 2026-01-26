import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,

  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { createAdmin, getAdmin, updateAdmin, type CreateAdminRequest } from '../../api/adminUsers';
import { AdminRole, ModuleName, type ModulePermissions } from '../../types/adminUsers';
import { useCanWriteAdmins, useCanEditAdmins } from '../../hook/useCapabilities';
import RequireAdminPermission from '../../components/RequireAdminPermission';
import RoleMatrix from '../../components/RoleMatrix';

const AdminUpsertDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: [] as AdminRole[],
    permissions: {} as Record<ModuleName, unknown>,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // صلاحيات المستخدم
  const canWriteAdmins = useCanWriteAdmins();
  const canEditAdmins = useCanEditAdmins();

  // جلب بيانات المسؤول عند التعديل
  useEffect(() => {
    if (isEdit && id) {
      fetchAdmin();
    }
  }, [isEdit, id]);

  const fetchAdmin = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const admin = await getAdmin(id);

      setFormData({
        name: admin.username,
        email: admin.username, // استخدام username كـ email مؤقتاً
        password: '',
        confirmPassword: '',
        roles: admin.roles as AdminRole[],
        permissions: admin.permissions,
        isActive: admin.isActive,
      });
    } catch (error) {
      console.error('خطأ في جلب بيانات المسؤول:', error);
      setSnackbar({
        open: true,
        message: 'فشل في تحميل بيانات المسؤول',
        severity: 'error',
      });
      navigate('/admin/admins');
    } finally {
      setLoading(false);
    }
  };

  // التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 6) {
        newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
      }
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'يجب اختيار دور واحد على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // حفظ النموذج
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const submitData = {
        name: formData.name,
        email: formData.email,
        ...(isEdit ? {} : { password: formData.password }),
        roles: formData.roles,
        permissions: formData.permissions,
        isActive: formData.isActive,
      };

      if (isEdit && id) {
        await updateAdmin(id, submitData);
        setSnackbar({
          open: true,
          message: 'تم تحديث المسؤول بنجاح',
          severity: 'success',
        });
      } else {
        await createAdmin(submitData as CreateAdminRequest);
        setSnackbar({
          open: true,
          message: 'تم إنشاء المسؤول بنجاح',
          severity: 'success',
        });
      }

      navigate('/admin/admins');
    } catch (error) {
      console.error('خطأ في حفظ المسؤول:', error);
      setSnackbar({
        open: true,
        message: 'فشل في حفظ المسؤول',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // تحديث الحقول الأساسية
  const handleFieldChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // تحديث الأدوار
  const handleRoleChange = (role: AdminRole, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  // تحديث الصلاحيات
    const handlePermissionChange = (module: ModuleName, permission: keyof ModulePermissions, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...(prev.permissions[module] as ModulePermissions),
          [permission]: checked,
        },
      },
    }));
  };

  // فحص الصلاحية
  const canEdit = (isEdit && canEditAdmins) || (!isEdit && canWriteAdmins);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <RequireAdminPermission permission={isEdit ? 'edit' : 'write'}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/admins')}
            sx={{ mr: 2 }}
          >
            العودة
          </Button>
          <Typography variant="h4">
            {isEdit ? 'تعديل المسؤول' : 'إضافة مسؤول جديد'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* البيانات الأساسية */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    البيانات الأساسية
                  </Typography>

                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="اسم المسؤول"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />

                    <TextField
                      fullWidth
                      label="البريد الإلكتروني"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />

                    {!isEdit && (
                      <>
                        <TextField
                          fullWidth
                          label="كلمة المرور"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleFieldChange('password', e.target.value)}
                          error={!!errors.password}
                          helperText={errors.password}
                          required
                        />

                        <TextField
                          fullWidth
                          label="تأكيد كلمة المرور"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword}
                          required
                        />
                      </>
                    )}

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isActive}
                          onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                        />
                      }
                      label="حساب نشط"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* الأدوار */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    الأدوار
                  </Typography>

                  <Stack spacing={2}>
                    {Object.values(AdminRole).map((role) => (
                      <FormControlLabel
                        key={role}
                        control={
                          <Checkbox
                            checked={formData.roles.includes(role)}
                            onChange={(e) => handleRoleChange(role, e.target.checked)}
                            disabled={!canEdit}
                          />
                        }
                        label={role}
                      />
                    ))}
                  </Stack>

                  {errors.roles && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.roles}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* مصفوفة الصلاحيات */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <RoleMatrix
                    permissions={formData.permissions as Partial<Record<ModuleName, ModulePermissions>>}
                    onPermissionChange={handlePermissionChange}
                    disabled={!canEdit}
                    showRoleLabels={true}
                    selectedRoles={formData.roles}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* أزرار الحفظ */}
              <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/admins')}
                  disabled={saving}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving || !canEdit}
                >
                  {saving ? 'حفظ...' : 'حفظ'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

      {/* Snackbar للرسائل */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </RequireAdminPermission>
  );
};

export default AdminUpsertDrawer;
