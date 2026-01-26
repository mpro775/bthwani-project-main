// =============== Types ===============

export interface ModuleDefinition {
  name: string; // مثال: "vendors", "ops.drivers", "quality.reviews"
  actions: string[]; // مثال: ["read", "write", "act"]
  label?: string;
  description?: string;
}
// types.ts (الملف الموجود بجانب مكونات إدارة المشرفين)

// الدور والحالة
export type AdminStatus = "active" | "disabled";
export type AdminRole = "superadmin" | "admin" | "manager" | "support";

// شكل قدرات الوحدات كما يعيدها الباك (للتحويل الداخلي)
export type ModuleCaps = {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  approve?: boolean;
  export?: boolean;
};
export type CapabilitiesMap = Record<string, ModuleCaps>;

// تمثيل المشرف الكامل في الواجهة
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  // ملاحظة: في الواجهة نتعامل عادة مع "capabilities" بشكل خريطة عند القراءة
  // لكن عند الإرسال نستخدم مصفوفة flatCaps في CreateAdminPayload
  capabilities?: CapabilitiesMap;
}

// عنصر القائمة المختصر
export interface AdminListItem {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  capsCount: number; // ← هذا كان مفقود
}

// استجابة قائمة المشرفين
export interface AdminsListResponse {
  data: AdminListItem[];
  total?: number;
}

// بارامترات الفلترة (إن وُجدت)
export interface UsersListParams {
  q?: string;
  role?: AdminRole;
  status?: AdminStatus;
  page?: number;
  pageSize?: number;
}

// الحمولة عند الإنشاء/التعديل
export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  // ملاحظة مهمة: نجعلها flat caps لأن RoleMatrix تتعامل مع string[]
  capabilities: string[]; // ← بدلاً من CapabilityGrant[]
}

export interface CapabilityGrant {
  module: string;
  actions: string[];
}



export interface AdminListItem {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt?: string;
  capsCount: number;
}



// =============== API Types ===============



// =============== Capabilities Context Types ===============
export interface CapabilitiesContextType {
  capabilities: string[]; // شكل: "module:action" مثل vendors:read
  can: (cap: string) => boolean;
  setCapabilities: (caps: string[]) => void;
}
