import axios from "../../../../utils/axios";
import type { Note, OrderRow, OrderStatus } from "../types";
export type OrderType = "marketplace" | "errand";
// ✅ جديد: مصدر الطلب للـ errand (SHEIN أو غيره)
export type OrderSource = "shein" | "other";
export type OrdersFilters = Partial<{
  q: string;
  status: string;
  city: string;
  storeId: string;
  driverId: string;
  userId: string; // ✅ جديد
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  orderType: OrderType; // ⬅️ جديد
  source: OrderSource; // ⬅️ جديد

  paymentMethod: string;
}>;
export const OrdersApi = {
  list: (filters: OrdersFilters) =>
    axios
      .get<OrderRow[]>("/delivery/order", { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    axios.get<OrderRow>(`/delivery/order/${id}`).then((r) => r.data),

  changeStatus: (
    id: string,
    payload: { status: OrderStatus; reason?: string; returnBy?: string }
  ) => axios.patch(`/delivery/order/${id}/admin-status`, payload),

  assignDriver: (id: string, driverId: string) =>
    axios.patch(`/delivery/order/${id}/assign-driver`, { driverId }),

  // SubOrders
  assignDriverToSub: (orderId: string, subId: string, driverId: string) =>
    axios.patch(`/delivery/order/${orderId}/suborders/${subId}/assign-driver`, {
      driverId,
    }),

  changeSubStatus: (
    orderId: string,
    subId: string,
    status: OrderStatus,
    reason?: string,
    returnBy?: string
  ) =>
    axios.patch(`/delivery/order/${orderId}/suborders/${subId}/status`, {
      status,
      reason,
      returnBy,
    }),

  setPOD: (id: string, deliveryReceiptNumber: string) =>
    axios.patch(`/delivery/order/${id}/pod`, { deliveryReceiptNumber }),

  setSubPOD: (orderId: string, subId: string, deliveryReceiptNumber: string) =>
    axios.patch(`/delivery/order/${orderId}/suborders/${subId}/pod`, {
      deliveryReceiptNumber,
    }),
  // ✅ جديد — إجراءات الشراء بالإنابة (SHEIN)
  markProcured: (
    id: string,
    body: { externalOrderNo: string; invoiceUrl?: string }
  ) =>
    axios.patch(`/delivery/order/${id}/procurement`, {
      ...body,
      status: "procured",
    }),

  failProcurement: (id: string, reason: string) =>
    axios.patch(`/delivery/order/${id}/procurement`, {
      status: "procurement_failed",
      reason,
    }),

  // ✅ ضبط نقطة الانطلاق للـ Utility SubOrder
  setUtilitySubOrigin: (
    orderId: string,
    subId: string,
    body: { label?: string; city?: string; lat: number; lng: number }
  ) => axios.patch(`/utility/order/${orderId}/sub/${subId}/origin`, body),

  // Notes
  addNote: (orderId: string, body: string, visibility: "public" | "internal") =>
    axios
      .post<Note>(`/delivery/order/${orderId}/notes`, { body, visibility })
      .then((r) => r.data),

  listNotes: (
    orderId: string,
    visibility: "public" | "internal" | "all" = "all"
  ) =>
    axios
      .get<Note[]>(`/delivery/order/${orderId}/notes`, {
        params: { visibility },
      })
      .then((r) => r.data),

  // Export
  exportExcel: (filters: OrdersFilters) =>
    axios.get(`/delivery/order/export/orders/excel`, {
      params: filters,
      responseType: "blob",
    }),
};
