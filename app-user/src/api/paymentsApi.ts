import axiosInstance from "../utils/api/axiosInstance";
import { refreshIdToken } from "./authService";

/**
 * Helper لجلب headers المصادقة
 */
const getAuthHeaders = async () => {
  try {
    const token = await refreshIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn("⚠️ فشل في جلب التوكن:", error);
    return {};
  }
};

// ==================== Types ====================

export interface CreateHoldPayload {
  userId: string;
  amount: number;
  reference: string;
}

export interface HoldItem {
  _id: string;
  userId: string;
  amount: number;
  reference: string;
  status: 'active' | 'released' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundPayload {
  reason?: string;
}

// ==================== API Functions ====================

/**
 * إنشاء عربون (hold funds)
 */
export const createHold = async (
  payload: CreateHoldPayload
): Promise<HoldItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/api/v2/payments/holds", payload, {
    headers,
  });
  return response.data;
};

/**
 * إطلاق الأموال المحجوزة (release funds)
 */
export const releaseHold = async (holdId: string): Promise<HoldItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/v2/payments/holds/${holdId}/release`, {}, {
    headers,
  });
  return response.data;
};

/**
 * استرداد الأموال المحجوزة (refund funds)
 */
export const refundHold = async (
  holdId: string,
  payload?: RefundPayload
): Promise<HoldItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/v2/payments/holds/${holdId}/refund`, payload || {}, {
    headers,
  });
  return response.data;
};

/**
 * جلب تفاصيل عربون محدد
 */
export const getHoldDetails = async (holdId: string): Promise<HoldItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v2/payments/holds/${holdId}`, {
    headers,
  });
  return response.data;
};

/**
 * جلب قائمة الأعرابين للمستخدم الحالي
 */
export const getMyHolds = async (): Promise<HoldItem[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get("/api/v2/payments/holds/my", {
    headers,
  });
  return response.data;
};
