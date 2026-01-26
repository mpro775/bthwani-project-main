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

export type KawaderStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface KawaderMetadata {
  experience?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  [key: string]: any;
}

export interface CreateKawaderPayload {
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: KawaderMetadata;
  status?: KawaderStatus;
}

export interface UpdateKawaderPayload {
  title?: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: KawaderMetadata;
  status?: KawaderStatus;
}

export interface KawaderItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: KawaderMetadata;
  status: KawaderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface KawaderListResponse {
  data: KawaderItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== API Functions ====================

/**
 * إنشاء كادر وظيفي جديد
 */
export const createKawader = async (
  payload: CreateKawaderPayload
): Promise<KawaderItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/kawader", payload, {
    headers,
  });
  return response.data;
};

/**
 * جلب قائمة الكوادر
 */
export const getKawaderList = async (
  cursor?: string
): Promise<KawaderListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/kawader", {
    headers,
    params,
  });
  return response.data;
};

/**
 * جلب تفاصيل كادر محدد
 */
export const getKawaderDetails = async (id: string): Promise<KawaderItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/kawader/${id}`, {
    headers,
  });
  return response.data;
};

/**
 * تحديث كادر
 */
export const updateKawader = async (
  id: string,
  payload: UpdateKawaderPayload
): Promise<KawaderItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/kawader/${id}`, payload, {
    headers,
  });
  return response.data;
};

/**
 * حذف كادر
 */
export const deleteKawader = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/kawader/${id}`, {
    headers,
  });
};

/**
 * جلب كوادري الخاصة
 */
export const getMyKawader = async (
  cursor?: string
): Promise<KawaderListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/kawader/my", {
    headers,
    params,
  });
  return response.data;
};

/**
 * البحث في الكوادر
 */
export const searchKawader = async (
  query: string,
  status?: KawaderStatus,
  cursor?: string
): Promise<KawaderListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = { q: query };
  if (status) params.status = status;
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get("/kawader/search", {
    headers,
    params,
  });
  return response.data;
};
