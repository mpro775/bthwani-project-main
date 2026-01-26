import { useMemo } from "react";
import {
  ModuleName,
  type ModulePermissions,
  ADMIN_PERMISSIONS,
} from "../types/adminUsers";

export interface UserCapabilities {
  [key: string]: boolean;
}
export interface User {
  roles?: string[];
  permissions?: Partial<Record<ModuleName, ModulePermissions>>;
}

const isSuperAdmin = (user: User | null) => {
  // فحص أساسي للتأكد من وجود المستخدم
  if (!user?.roles || !Array.isArray(user.roles)) return false;

  const roles = user.roles.map((r) => r.toLowerCase());
  return (
    roles.includes("superadmin") ||
    roles.includes("super_admin") ||
    roles.includes("super-admin")
  );
};

const checkPermission = (
  user: User | null,
  module: ModuleName,
  permission: keyof ModulePermissions
): boolean => {
  // إذا لم يكن هناك مستخدم، لا صلاحية
  if (!user) return false;

  // السوبر أدمن له جميع الصلاحيات دائمًا - حتى لو لم تصل الصلاحيات بعد
  if (isSuperAdmin(user)) return true;

  // فحص الصلاحيات العادية فقط إذا لم يكن سوبر أدمن
  const modulePermissions = user.permissions?.[module];
  return modulePermissions?.[permission] === true;
};

export const useCapabilities = (
  userParam: User | null = null
): UserCapabilities => {
  // نستخدم userParam فقط، لا نحتاج useAuth هنا
  const user = userParam;

  return useMemo(() => {
    if (!user) return {};

    const capabilities: UserCapabilities = {};

    // السوبر أدمن له جميع الصلاحيات - نضمن ذلك هنا أيضًا
    const isUserSuperAdmin = isSuperAdmin(user);

    // من ADMIN_PERMISSIONS
    Object.entries(ADMIN_PERMISSIONS).forEach(([permissionKey, config]) => {
      capabilities[permissionKey] = isUserSuperAdmin || checkPermission(
        user,
        config.module,
        config.permission
      );
    });

    // من permissions الخام
    const moduleNames = Object.values(ModuleName).filter(
      (v) => typeof v === "string"
    ) as ModuleName[];
    moduleNames.forEach((module) => {
      const modulePermissions = user.permissions?.[module];
      if (modulePermissions) {
        (Object.keys(modulePermissions) as (keyof ModulePermissions)[]).forEach(
          (permission) => {
            const capabilityKey = `${module}:${permission}`;
            capabilities[capabilityKey] = isUserSuperAdmin ||
              modulePermissions[permission] === true;
          }
        );
      }
    });

    return capabilities;
  }, [user]); // تعتمد فقط على الـ user المحدد، سواء كان من userParam أو authUser
};

export const useHasPermission = (
  permission: string,
  user?: User | null
): boolean => {
  // سوبر أدمن مسموح دائمًا
  if (isSuperAdmin(user ?? null)) return true;

  // استخراج module و permission من الـ permission string
  const parts = permission.split(':');
  if (parts.length !== 2) return true; // ممكن تخليها true لو حبيت تتسامح أكثر

  const module = parts[0] as ModuleName;
  const perm = parts[1] as keyof ModulePermissions;

  // فحص الصلاحية باستخدام checkPermission
  return checkPermission(user ?? null, module, perm);
};

// أمثلة مختصرة:
export const useCanReadAdmins = (user?: User | null) =>
  useHasPermission("admin.users:read", user);
export const useCanWriteAdmins = (user?: User | null) =>
  useHasPermission("admin.users:write", user);
export const useCanEditAdmins = (user?: User | null) =>
  useHasPermission("admin.users:edit", user);
export const useCanDeleteAdmins = (user?: User | null) =>
  useHasPermission("admin.users:delete", user);



// Drivers Management
export const useCanReadDrivers = (user?: User | null) =>
  useHasPermission("admin.drivers:read", user);
export const useCanWriteDrivers = (user?: User | null) =>
  useHasPermission("admin.drivers:write", user);
export const useCanEditDrivers = (user?: User | null) =>
  useHasPermission("admin.drivers:edit", user);
export const useCanDeleteDrivers = (user?: User | null) =>
  useHasPermission("admin.drivers:delete", user);
export const useCanManageDrivers = (user?: User | null) =>
  useHasPermission("admin.drivers:manage", user);

// Vendors Management
export const useCanReadVendors = (user?: User | null) =>
  useHasPermission("admin.vendors:read", user);
export const useCanWriteVendors = (user?: User | null) =>
  useHasPermission("admin.vendors:write", user);
export const useCanEditVendors = (user?: User | null) =>
  useHasPermission("admin.vendors:edit", user);
export const useCanDeleteVendors = (user?: User | null) =>
  useHasPermission("admin.vendors:delete", user);
export const useCanModerateVendors = (user?: User | null) =>
  useHasPermission("admin.vendors:moderate", user);

// Notifications Management
export const useCanReadNotifications = (user?: User | null) =>
  useHasPermission("admin.notifications:read", user);
export const useCanWriteNotifications = (user?: User | null) =>
  useHasPermission("admin.notifications:write", user);
export const useCanEditNotifications = (user?: User | null) =>
  useHasPermission("admin.notifications:edit", user);
export const useCanDeleteNotifications = (user?: User | null) =>
  useHasPermission("admin.notifications:delete", user);
export const useCanSendNotifications = (user?: User | null) =>
  useHasPermission("admin.notifications:send", user);

// Reports & Analytics
export const useCanReadReports = (user?: User | null) =>
  useHasPermission("admin.reports:read", user);
export const useCanExportReports = (user?: User | null) =>
  useHasPermission("admin.reports:export", user);
export const useCanReadAnalytics = (user?: User | null) =>
  useHasPermission("admin.analytics:read", user);

// Finance Management
export const useCanReadFinance = (user?: User | null) =>
  useHasPermission("admin.finance:read", user);
export const useCanWriteFinance = (user?: User | null) =>
  useHasPermission("admin.finance:write", user);
export const useCanApproveFinance = (user?: User | null) =>
  useHasPermission("admin.finance:approve", user);

// Wallet Management
export const useCanReadWallet = (user?: User | null) =>
  useHasPermission("admin.wallet:read", user);
export const useCanWriteWallet = (user?: User | null) =>
  useHasPermission("admin.wallet:write", user);
export const useCanManageWallet = (user?: User | null) =>
  useHasPermission("admin.wallet:manage", user);

// Settings Management
export const useCanReadSettings = (user?: User | null) =>
  useHasPermission("admin.settings:read", user);
export const useCanWriteSettings = (user?: User | null) =>
  useHasPermission("admin.settings:write", user);

// CMS Management
export const useCanReadCms = (user?: User | null) =>
  useHasPermission("admin.cms:read", user);
export const useCanWriteCms = (user?: User | null) =>
  useHasPermission("admin.cms:write", user);
export const useCanEditCms = (user?: User | null) =>
  useHasPermission("admin.cms:edit", user);
export const useCanDeleteCms = (user?: User | null) =>
  useHasPermission("admin.cms:delete", user);

// Commission Plans Management
export const useCanReadCommissions = (user?: User | null) =>
  useHasPermission("admin.commissions:read", user);
export const useCanWriteCommissions = (user?: User | null) =>
  useHasPermission("admin.commissions:write", user);
export const useCanEditCommissions = (user?: User | null) =>
  useHasPermission("admin.commissions:edit", user);

// ER (Employee Relations) Management
export const useCanReadEr = (user?: User | null) =>
  useHasPermission("admin.er:read", user);
export const useCanWriteEr = (user?: User | null) =>
  useHasPermission("admin.er:write", user);
export const useCanManageEr = (user?: User | null) =>
  useHasPermission("admin.er:manage", user);

// Support Management
export const useCanReadSupport = (user?: User | null) =>
  useHasPermission("admin.support:read", user);
export const useCanWriteSupport = (user?: User | null) =>
  useHasPermission("admin.support:write", user);
export const useCanManageSupport = (user?: User | null) =>
  useHasPermission("admin.support:manage", user);
