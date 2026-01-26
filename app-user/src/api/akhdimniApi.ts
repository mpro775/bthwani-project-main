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

export interface Location {
  lat: number;
  lng: number;
}

export interface ErrandPoint {
  label?: string;
  street?: string;
  city?: string;
  contactName?: string;
  phone?: string;
  location: Location;
}

export interface CalculateFeePayload {
  category: string;
  size: string;
  weightKg?: number;
  pickup: {
    location: Location;
    city?: string;
    street?: string;
  };
  dropoff: {
    location: Location;
    city?: string;
    street?: string;
  };
  tip?: number;
}

export interface FeeCalculationResult {
  distanceKm: number;
  deliveryFee: number;
  totalWithTip: number;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    sizeFee: number;
    weightFee: number;
    tip: number;
  };
}

export interface CreateErrandPayload {
  category: string;
  description?: string;
  size: string;
  weightKg?: number;
  pickup: ErrandPoint;
  dropoff: ErrandPoint;
  waypoints?: Array<{ label?: string; location: Location }>;
  tip?: number;
  scheduledFor?: string | null;
  paymentMethod: string;
  notes?: string;
}

export interface ErrandOrder {
  _id: string;
  orderNumber: string;
  user: string;
  status: string;
  errand: {
    category: string;
    description?: string;
    size: string;
    weightKg?: number;
    pickup: ErrandPoint;
    dropoff: ErrandPoint;
    distanceKm: number;
  };
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: string;
  driver?: any;
  scheduledFor?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API Functions ====================

/**
 * حساب رسوم المهمة قبل إنشائها
 */
export const calculateErrandFee = async (
  payload: CalculateFeePayload
): Promise<FeeCalculationResult> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    "/akhdimni/errands/calculate-fee",
    payload,
    { headers }
  );
  return response.data;
};

/**
 * إنشاء طلب مهمة جديد
 */
export const createErrand = async (
  payload: CreateErrandPayload
): Promise<ErrandOrder> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/akhdimni/errands", payload, {
    headers,
  });
  return response.data;
};

/**
 * جلب طلبات المستخدم من أخدمني
 */
export const getMyErrands = async (
  status?: string
): Promise<ErrandOrder[]> => {
  const headers = await getAuthHeaders();
  const params = status ? { status } : {};
  const response = await axiosInstance.get("/akhdimni/my-errands", {
    headers,
    params,
  });
  return response.data;
};

/**
 * جلب تفاصيل طلب محدد
 */
export const getErrandDetails = async (id: string): Promise<ErrandOrder> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/akhdimni/errands/${id}`, {
    headers,
  });
  return response.data;
};

/**
 * إلغاء طلب
 */
export const cancelErrand = async (
  id: string,
  reason: string
): Promise<ErrandOrder> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(
    `/akhdimni/errands/${id}/cancel`,
    { reason },
    { headers }
  );
  return response.data;
};

/**
 * تقييم المهمة بعد اكتمالها
 */
export const rateErrand = async (
  id: string,
  rating: {
    driver: number;
    service: number;
    comments?: string;
  }
): Promise<ErrandOrder> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/akhdimni/errands/${id}/rate`,
    rating,
    { headers }
  );
  return response.data;
};

