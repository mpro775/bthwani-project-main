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

/** استخراج data من استجابة الباكند الموحدة { success, data, meta } */
const unwrap = <T>(res: { data?: T } & Record<string, unknown>): T =>
  (res?.data !== undefined ? res.data : res) as T;

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
  images?: string[];
  city?: string;
  keywords?: string[];
  currency?: string;
  quantity?: number;
  postedOnBehalfOfPhone?: string;
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
}

export interface UpdateKenzPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status?: KenzStatus;
  images?: string[];
  city?: string;
  keywords?: string[];
  currency?: string;
  quantity?: number;
  postedOnBehalfOfPhone?: string;
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
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
  images?: string[];
  city?: string;
  viewCount?: number;
  keywords?: string[];
  currency?: string;
  quantity?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  postedOnBehalfOfPhone?: string;
  postedOnBehalfOfUserId?: string | { _id: string; name?: string; phone?: string };
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
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
  return unwrap(response.data);
};

export type KenzSortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

/**
 * جلب قائمة الإعلانات (مع دعم البحث والترتيب)
 */
/** شجرة فئات كنز (للفلاتر والنشر) */
export interface KenzCategoryTreeItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  order: number;
  children?: KenzCategoryTreeItem[];
}

export const getKenzCategoriesTree = async (): Promise<KenzCategoryTreeItem[]> => {
  const response = await axiosInstance.get("/kenz/categories");
  return (response?.data ?? []) as KenzCategoryTreeItem[];
};

export type KenzCondition = 'new' | 'used' | 'refurbished';

export type KenzDeliveryOption = 'meetup' | 'delivery' | 'both';

export const getKenzList = async (
  cursor?: string,
  category?: KenzCategory,
  status?: KenzStatus,
  city?: string,
  search?: string,
  sort?: KenzSortOption,
  condition?: KenzCondition,
  deliveryOption?: KenzDeliveryOption
): Promise<KenzListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = {};
  if (cursor) params.cursor = cursor;
  if (category) params.category = category;
  if (status) params.status = status;
  if (city) params.city = city;
  if (search) params.search = search;
  if (sort) params.sort = sort;
  if (condition) params.condition = condition;
  if (deliveryOption) params.deliveryOption = deliveryOption;

  const response = await axiosInstance.get("/kenz", {
    headers,
    params,
  });
  return unwrap(response.data);
};

/**
 * جلب تفاصيل إعلان محدد
 */
export const getKenzDetails = async (id: string): Promise<KenzItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/kenz/${id}`, {
    headers,
  });
  return unwrap(response.data);
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
  return unwrap(response.data);
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
  return unwrap(response.data);
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
  return unwrap(response.data);
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
 * تعليم الإعلان كمباع (للمالك فقط، يتطلب مصادقة)
 */
export const markKenzAsSold = async (id: string): Promise<KenzItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/kenz/${id}/sold`, {}, { headers });
  return unwrap(response.data);
};

export interface ReportKenzPayload {
  reason: string;
  notes?: string;
}

/**
 * الإبلاغ عن إعلان (يتطلب مصادقة)
 */
export const reportKenz = async (
  id: string,
  payload: ReportKenzPayload
): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/kenz/${id}/report`, payload, { headers });
  return unwrap(response.data);
};

/**
 * جلب إحصائيات الإعلانات
 */
export const getKenzStats = async () => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get("/kenz/stats", {
    headers,
  });
  return unwrap(response.data);
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
  return unwrap(response.data);
};

/**
 * إضافة إعلان للمفضلة (يتطلب مصادقة)
 */
export const addKenzFavorite = async (kenzId: string): Promise<{ success: boolean }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/kenz/${kenzId}/favorite`, {}, { headers });
  return unwrap(response.data);
};

/**
 * إزالة إعلان من المفضلة (يتطلب مصادقة)
 */
export const removeKenzFavorite = async (kenzId: string): Promise<{ success: boolean }> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/kenz/${kenzId}/favorite`, { headers });
  return { success: true };
};

/**
 * قائمة إعلاناتي المفضلة (يتطلب مصادقة)
 */
export const getKenzFavorites = async (
  cursor?: string
): Promise<KenzListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/kenz/favorites", {
    headers,
    params,
  });
  return unwrap(response.data);
};
