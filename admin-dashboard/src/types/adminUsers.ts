// أنواع البيانات لإدارة المسؤولين والصلاحيات

export enum ModuleName {
  ADMIN = "admin",
  DELIVERY = "delivery",
  HR = "hr",
  FINANCE = "finance",
  OFFERS = "offers",
  STORES = "stores",
  USERS = "users",
  ORDERS = "orders",
  PRODUCTS = "products",
  NOTIFICATION = "notification",
  QUALITY = "quality",
}

export enum AdminRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  MANAGER = "manager",
  VENDOR = "vendor",
}

export interface ModulePermissions {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  approve?: boolean;
  export?: boolean;
}

export interface AdminUser {
  _id: string;
  username: string;
  roles: AdminRole[];
  permissions: Partial<Record<ModuleName, ModulePermissions>>;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  roles?: AdminRole[];
  permissions?: Partial<Record<ModuleName, ModulePermissions>>;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  roles?: AdminRole[];
  permissions?: Partial<Record<ModuleName, ModulePermissions>>;
  isActive?: boolean;
}

export interface ModuleDefinition {
  name: ModuleName;
  displayName: string;
  displayNameAr: string;
  permissions: Array<{
    key: keyof ModulePermissions;
    displayName: string;
    displayNameAr: string;
  }>;
}

// صلاحيات محددة لكل موديول
export const MODULE_PERMISSIONS: Record<ModuleName, ModuleDefinition> = {
  [ModuleName.ADMIN]: {
    name: ModuleName.ADMIN,
    displayName: "Admin Management",
    displayNameAr: "إدارة المشرفين",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
    ],
  },
  [ModuleName.DELIVERY]: {
    name: ModuleName.DELIVERY,
    displayName: "Delivery Management",
    displayNameAr: "إدارة التوصيل",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
      { key: "export", displayName: "Export", displayNameAr: "تصدير" },
    ],
  },
  [ModuleName.HR]: {
    name: ModuleName.HR,
    displayName: "Human Resources",
    displayNameAr: "الموارد البشرية",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
    ],
  },
  [ModuleName.FINANCE]: {
    name: ModuleName.FINANCE,
    displayName: "Finance",
    displayNameAr: "المالية",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
      { key: "export", displayName: "Export", displayNameAr: "تصدير" },
    ],
  },
  [ModuleName.OFFERS]: {
    name: ModuleName.OFFERS,
    displayName: "Offers & Promotions",
    displayNameAr: "العروض والترويج",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
    ],
  },
  [ModuleName.STORES]: {
    name: ModuleName.STORES,
    displayName: "Stores Management",
    displayNameAr: "إدارة المتاجر",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
    ],
  },
  [ModuleName.USERS]: {
    name: ModuleName.USERS,
    displayName: "Users Management",
    displayNameAr: "إدارة المستخدمين",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "export", displayName: "Export", displayNameAr: "تصدير" },
    ],
  },
  [ModuleName.ORDERS]: {
    name: ModuleName.ORDERS,
    displayName: "Orders Management",
    displayNameAr: "إدارة الطلبات",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
      { key: "export", displayName: "Export", displayNameAr: "تصدير" },
    ],
  },
  [ModuleName.PRODUCTS]: {
    name: ModuleName.PRODUCTS,
    displayName: "Products Management",
    displayNameAr: "إدارة المنتجات",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
    ],
  },
  [ModuleName.NOTIFICATION]: {
    name: ModuleName.NOTIFICATION,
    displayName: "Notifications",
    displayNameAr: "الإشعارات",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
    ],
  },
  [ModuleName.QUALITY]: {
    name: ModuleName.QUALITY,
    displayName: "Quality Control",
    displayNameAr: "مراقبة الجودة",
    permissions: [
      { key: "view", displayName: "View", displayNameAr: "عرض" },
      { key: "create", displayName: "Create", displayNameAr: "إنشاء" },
      { key: "edit", displayName: "Edit", displayNameAr: "تعديل" },
      { key: "delete", displayName: "Delete", displayNameAr: "حذف" },
      { key: "approve", displayName: "Approve", displayNameAr: "موافقة" },
    ],
  },
};

// صلاحيات محددة للمسؤولين
export const ADMIN_PERMISSIONS = {
  "admin.users:read": { module: ModuleName.ADMIN, permission: "view" as keyof ModulePermissions },
  "admin.users:write": { module: ModuleName.ADMIN, permission: "create" as keyof ModulePermissions },
  "admin.users:edit": { module: ModuleName.ADMIN, permission: "edit" as keyof ModulePermissions },
  "admin.users:delete": { module: ModuleName.ADMIN, permission: "delete" as keyof ModulePermissions },
};
