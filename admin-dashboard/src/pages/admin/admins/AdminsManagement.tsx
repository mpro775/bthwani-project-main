/**
 * ملف تصدير رئيسي لإدارة المشرفين
 * يوفر جميع المكونات والأدوات المطلوبة لإدارة المشرفين في النظام
 */

// تصدير المكونات فقط (لدعم Fast refresh)
export {
  // المكونات الرئيسية
  AdminsListPage,
  AdminUpsertDrawer,
  AdminDetailsRoute,

  // مكونات مساعدة
  RoleMatrix,

  // Context and hooks
  CapabilitiesProvider,
  useCapabilities,
  CapGuard,
} from "./components";

export {
  apiListAdmins,
  apiCreateAdmin,
  apiGetAdmin,
  apiPatchAdmin,
  apiPatchAdminStatus,
  apiGetModules,
} from "./api";

// تصدير الأنواع من ملفها المخصص
export type {
  AdminStatus,
  AdminRole,
  ModuleDefinition,
  CapabilityGrant,
  AdminUser,
  AdminListItem,
  AdminsListResponse,
  UsersListParams,
  CreateAdminPayload,
  CapabilitiesContextType,
} from "./types";

