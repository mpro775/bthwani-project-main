import type { ModuleName } from "../../type/admin";

export const adminRoles = [
  { value: "superadmin", label: "سوبر أدمن" },
  { value: "admin", label: "أدمن" },
  { value: "manager", label: "مدير" },
  { value: "vendor", label: "تاجر" },
] as const;

export const moduleNames: { value: ModuleName; label: string }[] = [
  { value: "admin", label: "الإدارة" },
  { value: "delivery", label: "التوصيل" },
  { value: "hr", label: "الموارد البشرية" },
  { value: "finance", label: "المالية" },
  { value: "offers", label: "العروض" },
  { value: "stores", label: "المتاجر" },
  { value: "users", label: "المستخدمين" },
  { value: "orders", label: "الطلبات" },
  { value: "products", label: "المنتجات" },
  { value: "notification", label: "الإشعارات" },
  { value: "quailty", label: "الجودة" },
];


