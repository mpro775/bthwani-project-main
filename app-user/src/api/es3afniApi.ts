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

export type Es3afniStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Es3afniLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Es3afniMetadata {
  contact?: string;
  unitsNeeded?: number;
  urgency?: string;
  [key: string]: any;
}

export interface CreateEs3afniPayload {
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status?: Es3afniStatus;
}

export interface UpdateEs3afniPayload {
  title?: string;
  description?: string;
  bloodType?: string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status?: Es3afniStatus;
}

export interface Es3afniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status: Es3afniStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Es3afniListResponse {
  items: Es3afniItem[];
  nextCursor?: string;
}

// Blood types constants
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

// ==================== API Functions ====================

/**
 * إنشاء بلاغ تبرع بالدم جديد
 */
export const createEs3afni = async (
  payload: CreateEs3afniPayload
): Promise<Es3afniItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/es3afni", payload, {
    headers,
  });
  return response.data;
};

/**
 * جلب قائمة البلاغات
 */
export const getEs3afniList = async (
  cursor?: string
): Promise<Es3afniListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/es3afni", {
    headers,
    params,
  });
  return response.data;
};

/**
 * جلب تفاصيل بلاغ محدد
 */
export const getEs3afniDetails = async (id: string): Promise<Es3afniItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/es3afni/${id}`, {
    headers,
  });
  return response.data;
};

/**
 * تحديث بلاغ
 */
export const updateEs3afni = async (
  id: string,
  payload: UpdateEs3afniPayload
): Promise<Es3afniItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/es3afni/${id}`, payload, {
    headers,
  });
  return response.data;
};

/**
 * حذف بلاغ
 */
export const deleteEs3afni = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/es3afni/${id}`, {
    headers,
  });
};

/**
 * جلب بلاغاتي الخاصة
 */
export const getMyEs3afni = async (
  cursor?: string
): Promise<Es3afniListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/es3afni/my", {
    headers,
    params,
  });
  return response.data;
};

/**
 * البحث في البلاغات
 */
export const searchEs3afni = async (
  query: string,
  bloodType?: BloodType,
  status?: Es3afniStatus,
  cursor?: string
): Promise<Es3afniListResponse> => {
  const headers = await getAuthHeaders();
  const params: any = { q: query };
  if (bloodType) params.bloodType = bloodType;
  if (status) params.status = status;
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get("/es3afni/search", {
    headers,
    params,
  });
  return response.data;
};

/**
 * تحديث حالة البلاغ
 */
export const updateEs3afniStatus = async (
  id: string,
  status: Es3afniStatus
): Promise<Es3afniItem> => {
  return updateEs3afni(id, { status });
};

/**
 * جلب إحصائيات البلاغات
 */
export const getEs3afniStats = async () => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get("/es3afni/stats", {
    headers,
  });
  return response.data;
};
