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

export type ArabonStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ArabonMetadata {
  guests?: number;
  notes?: string;
  [key: string]: any;
}

export type ArabonBookingPeriod = 'hour' | 'day' | 'week';

export interface ArabonSocialLinks {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
}

export interface CreateArabonPayload {
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status?: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
}

export interface UpdateArabonPayload {
  title?: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status?: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
}

export interface ArabonItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ArabonListResponse {
  data: ArabonItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== API Functions ====================

/**
 * إنشاء عربون جديد
 * الباكند يغلّف الاستجابة بـ { success, data, meta }
 */
export const createArabon = async (
  payload: CreateArabonPayload
): Promise<ArabonItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/arabon", payload, {
    headers,
  });
  const raw = response.data;
  return (raw?.data ?? raw) as ArabonItem;
};

/**
 * جلب قائمة العربونات
 */
export const getArabonList = async (
  cursor?: string,
  status?: ArabonStatus
): Promise<ArabonListResponse> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (status) params.status = status;
  const response = await axiosInstance.get("/arabon", {
    headers,
    params: Object.keys(params).length ? params : undefined,
  });
  const d = response.data;
  return {
    data: d?.data ?? d?.items ?? [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
};

/**
 * جلب تفاصيل عربون محدد
 * الباكند يغلّف الاستجابة بـ { success, data, meta }
 */
export const getArabonDetails = async (id: string): Promise<ArabonItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/arabon/${id}`, {
    headers,
  });
  const raw = response.data;
  return (raw?.data ?? raw) as ArabonItem;
};

/**
 * تحديث عربون
 * الباكند يغلّف الاستجابة بـ { success, data, meta }
 */
export const updateArabon = async (
  id: string,
  payload: UpdateArabonPayload
): Promise<ArabonItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/arabon/${id}`, payload, {
    headers,
  });
  const raw = response.data;
  return (raw?.data ?? raw) as ArabonItem;
};

/**
 * حذف عربون
 */
export const deleteArabon = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/arabon/${id}`, {
    headers,
  });
};

/**
 * جلب عربوناتي الخاصة
 */
export const getMyArabon = async (
  cursor?: string,
  status?: ArabonStatus
): Promise<ArabonListResponse> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (status) params.status = status;
  const response = await axiosInstance.get("/arabon/my", {
    headers,
    params: Object.keys(params).length ? params : undefined,
  });
  const d = response.data;
  return {
    data: d?.data ?? d?.items ?? [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
};

/**
 * البحث في العربونات
 */
export const searchArabon = async (
  query: string,
  status?: ArabonStatus,
  cursor?: string
): Promise<ArabonListResponse> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string> = { q: query.trim() };
  if (status) params.status = status;
  if (cursor) params.cursor = cursor;
  const response = await axiosInstance.get("/arabon/search", {
    headers,
    params,
  });
  const d = response.data;
  return {
    data: d?.data ?? d?.items ?? [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
};

/**
 * إحصائيات العربونات (عامة أو عربوناتي عند scope=my)
 */
export interface ArabonStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalDepositAmount: number;
}

export const getArabonStats = async (
  scope?: "my"
): Promise<ArabonStats> => {
  const headers = await getAuthHeaders();
  const params = scope === "my" ? { scope: "my" } : undefined;
  const response = await axiosInstance.get("/arabon/stats", {
    headers,
    params,
  });
  // الباكند يرجع { success, data: <stats>, meta }
  const raw = (response.data as any)?.data ?? response.data;
  return {
    total: raw?.total ?? 0,
    draft: raw?.draft ?? 0,
    pending: raw?.pending ?? 0,
    confirmed: raw?.confirmed ?? 0,
    completed: raw?.completed ?? 0,
    cancelled: raw?.cancelled ?? 0,
    totalDepositAmount: raw?.totalDepositAmount ?? 0,
  };
};

/**
 * تحديث حالة عربون فقط
 * الباكند يغلّف الاستجابة بـ { success, data, meta }
 */
export const updateArabonStatus = async (
  id: string,
  status: ArabonStatus
): Promise<ArabonItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/arabon/${id}/status`, { status }, {
    headers,
  });
  const raw = response.data;
  return (raw?.data ?? raw) as ArabonItem;
};

/**
 * سجل تغيير الحالة (نشاط)
 */
export interface ArabonActivityItem {
  _id: string;
  arabonId: string;
  oldStatus?: string;
  newStatus: string;
  userId?: string;
  createdAt: string;
}

export interface ArabonActivityResponse {
  data: ArabonActivityItem[];
  nextCursor?: string;
  hasMore: boolean;
}

export const getArabonActivity = async (
  id: string,
  cursor?: string
): Promise<ArabonActivityResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : undefined;
  const response = await axiosInstance.get(`/arabon/${id}/activity`, {
    headers,
    params,
  });
  const d = response.data;
  return {
    data: d?.data ?? d?.items ?? [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
};

// ==================== طلبات العربون (تقديم طلب / قائمة الطلبات لصاحب المنشأة) ====================

export type ArabonRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ArabonRequestItem {
  _id: string;
  arabonId: string;
  requesterId: string;
  message?: string;
  status: ArabonRequestStatus;
  createdAt: string;
}

/**
 * تقديم طلب على عربون (من قبل أي مستخدم غير صاحب المنشأة)
 */
export const submitArabonRequest = async (
  arabonId: string,
  message?: string
): Promise<ArabonRequestItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/arabon/${arabonId}/request`,
    { message: message?.trim() || undefined },
    { headers }
  );
  const raw = response.data;
  return (raw?.data ?? raw) as ArabonRequestItem;
};

/**
 * قائمة الطلبات المقدمة على العربون (لصاحب المنشأة فقط)
 */
export const getArabonRequests = async (
  arabonId: string
): Promise<ArabonRequestItem[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/arabon/${arabonId}/requests`, {
    headers,
  });
  const d = response.data;
  return d?.data ?? [];
};
