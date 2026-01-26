export type ModuleName =
  | "admin"
  | "delivery"
  | "hr"
  | "finance"
  | "offers"
  | "stores"
  | "users"
  | "orders"
  | "products"
  | "notification"
  | "quailty";
// أضف أي قسم جديد هنا إذا لزم الأمر

export type AdminRole = "superadmin" | "admin" | "manager" | "vendor";

export interface ModulePermissions {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  approve?: boolean;
  export?: boolean;
}