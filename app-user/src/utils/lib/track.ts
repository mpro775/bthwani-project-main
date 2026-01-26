import axiosInstance from "@/utils/api/axiosInstance";

export type AppEvent =
  | { type: "app_open" }
  | { type: "signup" }
  | { type: "login" }
  | { type: "first_order"; orderId: string; value: number }
  | { type: "coupon_applied"; code: string; value?: number };

export async function track(ev: AppEvent) {
  try {
    await axiosInstance.post("/events", { ...ev, ts: Date.now() });
  } catch (e) {
    // نتجاهل الفشل كي لا يؤثر على تجربة المستخدم
  }
}
