// src/pages/admin/admins/schema.ts
import { z } from "zod";
import { validationUtils } from "../../../utils/validation";
import { ERROR_MESSAGES } from "../../../utils/errorMessages";
import type { AdminRole, AdminStatus } from "./types";

// Schema لإنشاء مشرف جديد
export const createAdminSchema = z.object({
  name: validationUtils.required(ERROR_MESSAGES.ADMIN.NAME_REQUIRED)
    .pipe(validationUtils.maxLength(100, ERROR_MESSAGES.ADMIN.NAME_TOO_LONG)),

  email: validationUtils.email(ERROR_MESSAGES.ADMIN.EMAIL_INVALID),

  password: validationUtils.strongPassword(),

  role: validationUtils.enum(
    ["superadmin", "admin", "manager", "support"] as const,
    ERROR_MESSAGES.ADMIN.ROLE_INVALID
  ),

  capabilities: z.array(z.string()).min(1, "يجب اختيار صلاحية واحدة على الأقل"),

  enabled: z.boolean().optional(),
});

// Schema لتحديث بيانات المشرف (بدون كلمة المرور)
export const updateAdminSchema = z.object({
  name: validationUtils.required(ERROR_MESSAGES.ADMIN.NAME_REQUIRED)
    .pipe(validationUtils.maxLength(100, ERROR_MESSAGES.ADMIN.NAME_TOO_LONG)),

  email: validationUtils.email(ERROR_MESSAGES.ADMIN.EMAIL_INVALID),

  role: validationUtils.enum(
    ["superadmin", "admin", "manager", "support"] as const,
    ERROR_MESSAGES.ADMIN.ROLE_INVALID
  ),

  status: validationUtils.enum(
    ["active", "disabled"] as const,
    ERROR_MESSAGES.ADMIN.STATUS_INVALID
  ),

  capabilities: z.array(z.string()).min(1, "يجب اختيار صلاحية واحدة على الأقل"),
});

// Schema لتسجيل دخول المشرف
export const adminLoginSchema = z.object({
  username: validationUtils.required("اسم المستخدم مطلوب"),
  password: validationUtils.required("كلمة المرور مطلوبة"),
});

// Schema لتغيير كلمة المرور
export const changeAdminPasswordSchema = z.object({
  currentPassword: validationUtils.required("كلمة المرور الحالية مطلوبة"),
  newPassword: validationUtils.strongPassword(),
  confirmPassword: z.string(),
}).refine((data: { newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

// Schema للبحث في المشرفين
export const adminSearchSchema = z.object({
  q: z.string().optional(),
  role: z.enum(["superadmin", "admin", "manager", "support"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).max(100).optional(),
});

// Schema لتحديث صلاحيات المشرف فقط
export const updateAdminCapabilitiesSchema = z.object({
  capabilities: z.array(z.string()).min(1, "يجب اختيار صلاحية واحدة على الأقل"),
});

// Schema لتحديث حالة المشرف فقط
export const updateAdminStatusSchema = z.object({
  status: validationUtils.enum(
    ["active", "disabled"] as const,
    ERROR_MESSAGES.ADMIN.STATUS_INVALID
  ),
});

// Schema لتحديث كلمة مرور المشرف بواسطة مشرف آخر
export const resetAdminPasswordSchema = z.object({
  newPassword: validationUtils.strongPassword(),
  confirmPassword: z.string(),
}).refine((data: { newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

// دوال مساعدة للتحقق من الصلاحيات
export const validateCapabilities = (capabilities: string[], modules: string[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  for (const cap of capabilities) {
    const [module, action] = cap.split(':');
    if (!module || !action) {
      errors.push(`صلاحية غير صالحة: ${cap}`);
      continue;
    }

    if (!modules.includes(module)) {
      errors.push(`وحدة غير موجودة: ${module}`);
    }

    const validActions = ["view", "create", "edit", "delete", "approve", "export"];
    if (!validActions.includes(action)) {
      errors.push(`إجراء غير صالح: ${action}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// دوال مساعدة للتحقق من الأدوار والحالة
export const validateAdminRole = (role: AdminRole): boolean => {
  const validRoles: AdminRole[] = ["superadmin", "admin", "manager", "support"];
  return validRoles.includes(role);
};

export const validateAdminStatus = (status: AdminStatus): boolean => {
  const validStatuses: AdminStatus[] = ["active", "disabled"];
  return validStatuses.includes(status);
};

// دالة للتحقق من صحة البريد الإلكتروني للمشرفين
export const validateAdminEmail = (email: string): Promise<{
  isValid: boolean;
  message?: string;
}> => {
  // هذه الدالة ستقوم بالتحقق من وجود البريد في قاعدة البيانات
  // في الوقت الحالي، سنقوم بالتحقق من الصيغة فقط
  const emailSchema = validationUtils.email();
  const result = emailSchema.safeParse(email);

  if (!result.success) {
    return Promise.resolve({
      isValid: false,
      message: result.error.issues[0]?.message,
    });
  }

  // هنا يمكن إضافة استدعاء API للتحقق من عدم تكرار البريد
  return Promise.resolve({ isValid: true });
};

// استنتاج أنواع البيانات من الـ schemas
export type CreateAdminData = z.infer<typeof createAdminSchema>;
export type UpdateAdminData = z.infer<typeof updateAdminSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type ChangeAdminPasswordData = z.infer<typeof changeAdminPasswordSchema>;
export type AdminSearchData = z.infer<typeof adminSearchSchema>;
export type UpdateAdminCapabilitiesData = z.infer<typeof updateAdminCapabilitiesSchema>;
export type UpdateAdminStatusData = z.infer<typeof updateAdminStatusSchema>;
export type ResetAdminPasswordData = z.infer<typeof resetAdminPasswordSchema>;
