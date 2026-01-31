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

/** استخراج data من استجابة الباكند الموحدة { success, data, meta } (مثل كنز والكوادر) */
const unwrap = <T>(res: { data?: T } & Record<string, unknown>): T =>
  (res?.data !== undefined ? res.data : res) as T;

// ==================== Types ====================

export type MaaroufStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type MaaroufKind = 'lost' | 'found';

export interface MaaroufMetadata {
  color?: string;
  location?: string;
  date?: string;
  contact?: string;
  [key: string]: any;
}

export interface CreateMaaroufPayload {
  ownerId: string;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status?: MaaroufStatus;
}

export interface UpdateMaaroufPayload {
  title?: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status?: MaaroufStatus;
}

export interface MaaroufItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status: MaaroufStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaaroufListResponse {
  data: MaaroufItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== API Functions ====================

/**
 * إنشاء إعلان معروف جديد
 */
export const createMaarouf = async (
  payload: CreateMaaroufPayload
): Promise<MaaroufItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/maarouf", payload, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * جلب قائمة الإعلانات
 * الباكند يغلّف الاستجابة بـ { success, data: { items, nextCursor } } — نستخرج بـ unwrap ثم نُوحّد إلى { data, nextCursor, hasMore }
 */
export const getMaaroufList = async (
  cursor?: string
): Promise<MaaroufListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/maarouf", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: MaaroufItem[]; data?: MaaroufItem[]; nextCursor?: string; hasMore?: boolean };
  const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  const nextCursor = raw?.nextCursor ?? undefined;
  const hasMore = typeof raw?.hasMore === "boolean" ? raw.hasMore : !!nextCursor;
  return { data: list, nextCursor, hasMore };
};

/**
 * جلب تفاصيل إعلان محدد
 */
export const getMaaroufDetails = async (id: string): Promise<MaaroufItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/maarouf/${id}`, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * تحديث إعلان معروف
 */
export const updateMaarouf = async (
  id: string,
  payload: UpdateMaaroufPayload
): Promise<MaaroufItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/maarouf/${id}`, payload, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * حذف إعلان معروف
 */
export const deleteMaarouf = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/maarouf/${id}`, {
    headers,
  });
};

/**
 * جلب إعلاناتي الخاصة
 */
export const getMyMaarouf = async (
  cursor?: string
): Promise<MaaroufListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/maarouf/my", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: MaaroufItem[]; data?: MaaroufItem[]; nextCursor?: string; hasMore?: boolean };
  const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  const nextCursor = raw?.nextCursor ?? undefined;
  const hasMore = typeof raw?.hasMore === "boolean" ? raw.hasMore : !!nextCursor;
  return { data: list, nextCursor, hasMore };
};

/**
 * البحث في الإعلانات
 */
export const searchMaarouf = async (
  query: string,
  kind?: MaaroufKind,
  cursor?: string
): Promise<MaaroufListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = { q: query };
  if (kind) params.kind = kind;
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get("/maarouf/search", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: MaaroufItem[]; data?: MaaroufItem[]; nextCursor?: string; hasMore?: boolean };
  const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  const nextCursor = raw?.nextCursor ?? undefined;
  const hasMore = typeof raw?.hasMore === "boolean" ? raw.hasMore : !!nextCursor;
  return { data: list, nextCursor, hasMore };
};
