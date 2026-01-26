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

export type KenzStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface CreateKenzPayload {
  ownerId: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status?: KenzStatus;
}

export interface UpdateKenzPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status?: KenzStatus;
}

export interface KenzItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status: KenzStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface KenzListResponse {
  items: KenzItem[];
  nextCursor?: string;
}

// فئات الإعلانات المحتملة
export const KENZ_CATEGORIES = [
  'إلكترونيات',
  'سيارات',
  'عقارات',
  'أثاث',
  'ملابس',
  'رياضة',
  'كتب',
  'خدمات',
  'وظائف',
  'حيوانات',
  'أخرى'
] as const;

export type KenzCategory = typeof KENZ_CATEGORIES[number];

// ==================== API Functions ====================

/**
 * إنشاء إعلان جديد في السوق
 */
export const createKenz = async (
  payload: CreateKenzPayload
): Promise<KenzItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/kenz", payload, {
    headers,
  });
  return response.data;
};

/**
 * جلب قائمة الإعلانات
 */
export const getKenzList = async (
  cursor?: string,
  category?: KenzCategory,
  status?: KenzStatus
): Promise<KenzListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (category) params.category = category;
  if (status) params.status = status;

  const response = await axiosInstance.get("/kenz", {
    headers,
    params,
  });
  return response.data;
};

/**
 * جلب تفاصيل إعلان محدد
 */
export const getKenzDetails = async (id: string): Promise<KenzItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/kenz/${id}`, {
    headers,
  });
  return response.data;
};

/**
 * تحديث إعلان
 */
export const updateKenz = async (
  id: string,
  payload: UpdateKenzPayload
): Promise<KenzItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/kenz/${id}`, payload, {
    headers,
  });
  return response.data;
};

/**
 * حذف إعلان
 */
export const deleteKenz = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/kenz/${id}`, {
    headers,
  });
};

/**
 * جلب إعلاناتي الخاصة
 */
export const getMyKenz = async (
  cursor?: string
): Promise<KenzListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/kenz/my", {
    headers,
    params,
  });
  return response.data;
};

/**
 * البحث في الإعلانات
 */
export const searchKenz = async (
  query: string,
  category?: KenzCategory,
  minPrice?: number,
  maxPrice?: number,
  status?: KenzStatus,
  cursor?: string
): Promise<KenzListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = { q: query };
  if (category) params.category = category;
  if (minPrice !== undefined) params.minPrice = minPrice;
  if (maxPrice !== undefined) params.maxPrice = maxPrice;
  if (status) params.status = status;
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get("/kenz/search", {
    headers,
    params,
  });
  return response.data;
};

/**
 * تحديث حالة الإعلان
 */
export const updateKenzStatus = async (
  id: string,
  status: KenzStatus
): Promise<KenzItem> => {
  return updateKenz(id, { status });
};

/**
 * جلب إحصائيات الإعلانات
 */
export const getKenzStats = async () => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get("/kenz/stats", {
    headers,
  });
  return response.data;
};

/**
 * جلب الإعلانات حسب الفئة
 */
export const getKenzByCategory = async (
  category: KenzCategory,
  cursor?: string
): Promise<KenzListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor, category } : { category };
  const response = await axiosInstance.get("/kenz/category", {
    headers,
    params,
  });
  return response.data;
};
