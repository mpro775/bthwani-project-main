// src/constants/statusMap.ts - خرائط التلوين والعرض للـ Enums في UI

export interface StatusMap {
  label: string;
  badge: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  color?: string; // للاستخدام المتقدم
}

// Order Status Mapping
export const ORDER_STATUS_MAP: Record<string, StatusMap> = {
  pending_confirmation: { label: "قيد التأكيد", badge: "warning" },
  under_review:         { label: "قيد المراجعة", badge: "warning" },
  preparing:            { label: "قيد التحضير", badge: "info" },
  assigned:             { label: "مُسند للسائق", badge: "info" },
  out_for_delivery:     { label: "في الطريق", badge: "info" },
  delivered:            { label: "تم التسليم", badge: "success" },
  returned:             { label: "مرتجع", badge: "danger" },
  awaiting_procurement: { label: "في انتظار التوريد", badge: "warning" },
  procured:             { label: "تم التوريد", badge: "success" },
  procurement_failed:   { label: "فشل التوريد", badge: "danger" },
  cancelled:            { label: "ملغي", badge: "secondary" },
};

// Payment Method Mapping
export const PAYMENT_METHOD_MAP: Record<string, StatusMap> = {
  cash:  { label: "نقدي", badge: "success" },
  card:  { label: "بطاقة", badge: "info" },
  wallet: { label: "محفظة", badge: "warning" },
  cod:   { label: "الدفع عند التسليم", badge: "secondary" },
  mixed: { label: "مختلط", badge: "primary" },
};

// User Role Mapping
export const USER_ROLE_MAP: Record<string, StatusMap> = {
  user:       { label: "مستخدم", badge: "default" },
  admin:      { label: "مدير", badge: "danger" },
  superadmin: { label: "مدير عام", badge: "danger" },
  customer:   { label: "عميل", badge: "info" },
  driver:     { label: "سائق", badge: "primary" },
  vendor:     { label: "تاجر", badge: "warning" },
  store:      { label: "متجر", badge: "secondary" },
};

// Driver Type Mapping
export const DRIVER_TYPE_MAP: Record<string, StatusMap> = {
  primary: { label: "سائق أساسي", badge: "success" },
  joker:   { label: "جوكر", badge: "warning" },
};

// Driver Availability Mapping
export const DRIVER_AVAILABILITY_MAP: Record<string, StatusMap> = {
  available: { label: "متاح", badge: "success" },
  busy:      { label: "مشغول", badge: "warning" },
  offline:   { label: "غير متصل", badge: "secondary" },
};

// Transaction Status Mapping
export const TRANSACTION_STATUS_MAP: Record<string, StatusMap> = {
  pending:   { label: "قيد المعالجة", badge: "warning" },
  completed: { label: "مكتمل", badge: "success" },
  failed:    { label: "فاشل", badge: "danger" },
  cancelled: { label: "ملغي", badge: "secondary" },
};

// Transaction Type Mapping
export const TRANSACTION_TYPE_MAP: Record<string, StatusMap> = {
  credit:  { label: "إيداع", badge: "success" },
  debit:   { label: "سحب", badge: "danger" },
  transfer: { label: "تحويل", badge: "info" },
  refund:  { label: "استرداد", badge: "warning" },
};

// Settlement Status Mapping
export const SETTLEMENT_STATUS_MAP: Record<string, StatusMap> = {
  pending:  { label: "قيد المراجعة", badge: "warning" },
  approved: { label: "معتمد", badge: "success" },
  rejected: { label: "مرفوض", badge: "danger" },
  paid:     { label: "مدفوع", badge: "info" },
};

// Support Ticket Status Mapping
export const SUPPORT_TICKET_STATUS_MAP: Record<string, StatusMap> = {
  new:     { label: "جديد", badge: "info" },
  open:    { label: "مفتوح", badge: "warning" },
  pending: { label: "في الانتظار", badge: "warning" },
  resolved: { label: "محلول", badge: "success" },
  closed:  { label: "مغلق", badge: "secondary" },
};

// Support Ticket Priority Mapping
export const SUPPORT_TICKET_PRIORITY_MAP: Record<string, StatusMap> = {
  low:    { label: "منخفض", badge: "default" },
  medium: { label: "متوسط", badge: "warning" },
  high:   { label: "عالي", badge: "danger" },
  urgent: { label: "عاجل", badge: "danger" },
};

// Boolean Status Mapping
export const BOOLEAN_STATUS_MAP: Record<string, StatusMap> = {
  true:  { label: "نعم", badge: "success" },
  false: { label: "لا", badge: "secondary" },
};

// Generic function to get status map
export function getStatusMap(type: string, value: string): StatusMap | undefined {
  const maps: Record<string, Record<string, StatusMap>> = {
    order_status: ORDER_STATUS_MAP,
    payment_method: PAYMENT_METHOD_MAP,
    user_role: USER_ROLE_MAP,
    driver_type: DRIVER_TYPE_MAP,
    driver_availability: DRIVER_AVAILABILITY_MAP,
    transaction_status: TRANSACTION_STATUS_MAP,
    transaction_type: TRANSACTION_TYPE_MAP,
    settlement_status: SETTLEMENT_STATUS_MAP,
    support_ticket_status: SUPPORT_TICKET_STATUS_MAP,
    support_ticket_priority: SUPPORT_TICKET_PRIORITY_MAP,
    boolean: BOOLEAN_STATUS_MAP,
  };

  return maps[type]?.[value];
}

// Helper function to get label for any enum value
export function getEnumLabel(type: string, value: string): string {
  const statusMap = getStatusMap(type, value);
  return statusMap?.label || value;
}

// Helper function to get badge type for any enum value
export function getEnumBadge(type: string, value: string): StatusMap['badge'] {
  const statusMap = getStatusMap(type, value);
  return statusMap?.badge || 'default';
}
