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

/** استخراج data من استجابة الباكند الموحدة { success, data, meta } (مثل كنز والكوادر ومعروف) */
const unwrap = <T>(res: { data?: T } & Record<string, unknown>): T =>
  (res?.data !== undefined ? res.data : res) as T;

// ==================== Types ====================

export type SanadStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type SanadKind = 'specialist' | 'emergency' | 'charity';

export interface SanadMetadata {
  location?: string;
  contact?: string;
  [key: string]: any;
}

export interface CreateSanadPayload {
  ownerId: string;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status?: SanadStatus;
}

export interface UpdateSanadPayload {
  title?: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status?: SanadStatus;
}

export interface SanadItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status: SanadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SanadListResponse {
  items: SanadItem[];
  nextCursor?: string;
}

// ==================== API Functions ====================

/**
 * إنشاء طلب سند جديد
 */
export const createSanad = async (
  payload: CreateSanadPayload
): Promise<SanadItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/sanad", payload, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * جلب قائمة الطلبات مع دعم cursor pagination
 * الباكند يغلّف الاستجابة بـ { success, data: { items, nextCursor } } — نستخرج بـ unwrap
 */
export const getSanadList = async (
  cursor?: string
): Promise<SanadListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/sanad", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: SanadItem[]; nextCursor?: string };
  return {
    items: Array.isArray(raw?.items) ? raw.items : [],
    nextCursor: raw?.nextCursor,
  };
};

/**
 * جلب تفاصيل طلب محدد
 */
export const getSanadDetails = async (id: string): Promise<SanadItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/sanad/${id}`, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * تحديث طلب سند
 */
export const updateSanad = async (
  id: string,
  payload: UpdateSanadPayload
): Promise<SanadItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/sanad/${id}`, payload, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * حذف طلب سند
 */
export const deleteSanad = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/sanad/${id}`, {
    headers,
  });
};

/**
 * جلب طلباتي الخاصة
 */
export const getMySanad = async (
  cursor?: string
): Promise<SanadListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/sanad/my", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: SanadItem[]; nextCursor?: string };
  return {
    items: Array.isArray(raw?.items) ? raw.items : [],
    nextCursor: raw?.nextCursor,
  };
};

/**
 * البحث في الطلبات
 */
export const searchSanad = async (
  query: string,
  kind?: SanadKind,
  cursor?: string
): Promise<SanadListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = { q: query };
  if (kind) params.kind = kind;
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get("/sanad/search", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: SanadItem[]; nextCursor?: string };
  return {
    items: Array.isArray(raw?.items) ? raw.items : [],
    nextCursor: raw?.nextCursor,
  };
};
