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

export type AmaniStatus = 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface AmaniLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface AmaniMetadata {
  passengers?: number;
  luggage?: boolean;
  specialRequests?: string;
  [key: string]: any;
}

export interface CreateAmaniPayload {
  ownerId: string;
  title: string;
  description?: string;
  origin?: AmaniLocation;
  destination?: AmaniLocation;
  metadata?: AmaniMetadata;
  status?: AmaniStatus;
}

export interface UpdateAmaniPayload {
  title?: string;
  description?: string;
  origin?: AmaniLocation;
  destination?: AmaniLocation;
  metadata?: AmaniMetadata;
  status?: AmaniStatus;
}

export interface AmaniDriver {
  _id: string;
  fullName?: string;
  phone?: string;
  vehicleType?: string;
}

export interface AmaniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  origin?: AmaniLocation;
  destination?: AmaniLocation;
  metadata?: AmaniMetadata;
  status: AmaniStatus;
  driver?: AmaniDriver | string;
  assignedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  driverLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    changedBy?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmaniListResponse {
  data: AmaniItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== API Functions ====================

/**
 * استخراج العنصر من استجابة الباكند المغلفة بـ { success, data }
 */
const unwrapData = <T>(raw: any): T => {
  if (raw && typeof raw === "object" && "data" in raw && raw.data !== undefined) {
    return raw.data as T;
  }
  return raw as T;
};

/**
 * إنشاء طلب أماني جديد
 */
export const createAmani = async (
  payload: CreateAmaniPayload
): Promise<AmaniItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/amani", payload, {
    headers,
  });
  return unwrapData<AmaniItem>(response.data);
};

/**
 * توحيد استجابة التغليف من الباكند (items/nextCursor) إلى (data/nextCursor/hasMore).
 * الباكند يغلّف الاستجابة بـ TransformInterceptor في { success, data } فالقائمة قد تكون في response.data.data.items
 */
const normalizeListResponse = (raw: any): AmaniListResponse => {
  const payload = raw?.data ?? raw;
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
          ? raw.items
          : [];
  const nextCursor = payload?.nextCursor ?? payload?.next_cursor ?? raw?.nextCursor ?? raw?.next_cursor;
  const hasMore = payload?.hasMore ?? raw?.hasMore ?? !!nextCursor;
  return { data, nextCursor, hasMore };
};

/**
 * جلب قائمة طلبات الأماني
 */
export const getAmaniList = async (
  cursor?: string
): Promise<AmaniListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/amani", {
    headers,
    params,
  });
  return normalizeListResponse(response.data);
};

/**
 * جلب تفاصيل طلب أماني محدد
 */
export const getAmaniDetails = async (id: string): Promise<AmaniItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/amani/${id}`, {
    headers,
  });
  return unwrapData<AmaniItem>(response.data);
};

/**
 * تحديث طلب أماني
 */
export const updateAmani = async (
  id: string,
  payload: UpdateAmaniPayload
): Promise<AmaniItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/amani/${id}`, payload, {
    headers,
  });
  return unwrapData<AmaniItem>(response.data);
};

/**
 * حذف طلب أماني
 */
export const deleteAmani = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/amani/${id}`, {
    headers,
  });
};

/**
 * جلب طلباتي الخاصة
 */
export const getMyAmani = async (
  cursor?: string
): Promise<AmaniListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/amani/my", {
    headers,
    params,
  });
  return normalizeListResponse(response.data);
};

/**
 * البحث في طلبات الأماني
 */
export const searchAmani = async (
  query: string,
  cursor?: string
): Promise<AmaniListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = { q: query };
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get("/amani/search", {
    headers,
    params,
  });
  return normalizeListResponse(response.data);
};
