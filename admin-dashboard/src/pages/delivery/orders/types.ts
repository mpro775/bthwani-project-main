export type OrderStatus =
  | "pending_confirmation"
  | "under_review"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "assigned"
  | "awaiting_procurement"
  | "procured"
  | "procurement_failed"
  | "cancelled";
export type UtilityKind = "gas" | "water";
export type PaymentMethod = "wallet" | "card" | "cash" | "mixed";
export type ProcurementInfo = {
  supplier?: "SHEIN";
  externalOrderNo?: string; // رقم الطلب عند SHEIN
  invoiceUrl?: string; // رابط الفاتورة (إن رفعتها إلى تخزينك)
  procuredAt?: string; // ISO date
};

export const statusLabels: Record<OrderStatus, string> = {
  pending_confirmation: "في انتظار تأكيد الإدارة",
  under_review: "قيد المراجعة",
  preparing: "قيد التحضير",
  out_for_delivery: "في الطريق إليك",
  delivered: "تم التوصيل",
  returned: "تم الإرجاع",
  assigned: "تم التعيين",
  awaiting_procurement: "في انتظار الشراء",
  procured: "تم الشراء",
  procurement_failed: "فشل الشراء",
  cancelled: "ملغاة",
};
export type OrderSource = "shein" | "other";

export const paymentLabels: Record<PaymentMethod, string> = {
  wallet: "محفظة",
  card: "بطاقة",
  cash: "نقدي",
  mixed: "مختلط",
};

export type UserLite = {
  _id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
};
export type StoreLite = { _id: string; name: string; logo?: string };
export type DriverLite = { _id: string; fullName?: string; phone?: string };
export type ItemLite = {
  name?: string;
  quantity: number;
  unitPrice: number;
  store?: StoreLite | string;
};

export type StatusHistory = {
  status: string;
  changedAt: string;
  changedBy: string;
};

export type SubOrder = {
  _id: string;
  store: StoreLite;
  items: ItemLite[];
  driver?: DriverLite;
  status: OrderStatus;
  deliveryReceiptNumber?: string;
  statusHistory?: StatusHistory[];
};

export type Note = {
  _id?: string;
  body: string;
  visibility: "public" | "internal";
  byRole: "customer" | "admin" | "store" | "driver" | "system";
  byId?: string;
  createdAt?: string;
};

export type OrderRow = {
  _id: string;
  orderType: "marketplace" | "errand" | "utility";
  source?: OrderSource; // ⬅️ جديد (للـ errand)
  status: OrderStatus;
  paymentMethod: "wallet" | "card" | "cash" | "mixed";
  price: number;
  walletUsed?: number;
  cashDue?: number;
  statusHistory?: { status: string; changedAt: string; changedBy: string }[];
  deliveryFee: number;
  createdAt: string;
  user?: { fullName?: string; name?: string; email?: string };
  address?: { label?: string; street?: string; city?: string };
  subOrders?: Array<{
    _id: string;
    store?: { _id: string; name: string } | null;
    origin?: {
      label?: string;
      city?: string;
      location?: { lat: number; lng: number };
    };
    status: OrderStatus;
    items: Array<{ name?: string; quantity: number; unitPrice: number }>;
  }>;
  utility?: {
    kind: UtilityKind; // "gas" | "water"
    city?: string;
    variant?: string; // "20L" أو "small|medium|large"
    quantity?: number; // الماء يسمح 0.5
    unitPrice?: number;
    subtotal?: number;
    cylinderSizeLiters?: number;
    tankerCapacityLiters?: number;
  };
  // معلومات SHEIN (اختياري)
  shein?: {
    externalOrderNo?: string;
    invoiceUrl?: string;
    procuredAt?: string;
  };
};
