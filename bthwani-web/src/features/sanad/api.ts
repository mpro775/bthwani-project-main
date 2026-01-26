// src/features/sanad/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  SanadItem,
  CreateSanadPayload,
  UpdateSanadPayload,
  SanadFilters,
  SanadListResponse,
  SanadSearchParams
} from './types';

// استخدام API v2 كما في الـ backend
const SANAD_API_BASE = '/api/v2/sanad';

/**
 * إنشاء طلب سند جديد
 */
export async function createSanad(payload: CreateSanadPayload): Promise<SanadItem> {
  const response = await axiosInstance.post(SANAD_API_BASE, payload);
  return response.data;
}

/**
 * استرجاع قائمة الطلبات
 */
export async function getSanadList(params?: {
  cursor?: string;
  limit?: number;
} & SanadFilters): Promise<SanadListResponse> {
  const response = await axiosInstance.get(SANAD_API_BASE, { params });
  return response.data;
}

/**
 * استرجاع طلب واحد
 */
export async function getSanad(id: string): Promise<SanadItem> {
  const response = await axiosInstance.get(`${SANAD_API_BASE}/${id}`);
  return response.data;
}

/**
 * تحديث طلب
 */
export async function updateSanad(id: string, payload: UpdateSanadPayload): Promise<SanadItem> {
  const response = await axiosInstance.patch(`${SANAD_API_BASE}/${id}`, payload);
  return response.data;
}

/**
 * حذف طلب
 */
export async function deleteSanad(id: string): Promise<void> {
  await axiosInstance.delete(`${SANAD_API_BASE}/${id}`);
}

/**
 * استرجاع طلبات المستخدم الحالي
 */
export async function getMySanadList(params?: {
  cursor?: string;
  limit?: number;
}): Promise<SanadListResponse> {
  const response = await axiosInstance.get(`${SANAD_API_BASE}/my`, { params });
  return response.data;
}

/**
 * البحث في الطلبات
 */
export async function searchSanad(params: SanadSearchParams): Promise<SanadListResponse> {
  const response = await axiosInstance.get(`${SANAD_API_BASE}/search`, { params });
  return response.data;
}
