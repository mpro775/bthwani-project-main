// src/features/es3afni/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  Es3afniItem,
  CreateEs3afniPayload,
  UpdateEs3afniPayload,
  Es3afniFilters,
  Es3afniListResponse
} from './types';

/**
 * إنشاء بلاغ تبرع بالدم جديد
 */
export async function createEs3afni(payload: CreateEs3afniPayload): Promise<Es3afniItem> {
  const response = await axiosInstance.post('/es3afni', payload);
  return response.data;
}

/**
 * استرجاع قائمة البلاغات
 */
export async function getEs3afniList(params?: {
  cursor?: string;
  limit?: number;
} & Es3afniFilters): Promise<Es3afniListResponse> {
  const response = await axiosInstance.get('/es3afni', { params });
  return response.data;
}

/**
 * استرجاع بلاغ واحد
 */
export async function getEs3afni(id: string): Promise<Es3afniItem> {
  const response = await axiosInstance.get(`/es3afni/${id}`);
  return response.data;
}

/**
 * تحديث بلاغ
 */
export async function updateEs3afni(id: string, payload: UpdateEs3afniPayload): Promise<Es3afniItem> {
  const response = await axiosInstance.patch(`/es3afni/${id}`, payload);
  return response.data;
}

/**
 * حذف بلاغ
 */
export async function deleteEs3afni(id: string): Promise<void> {
  await axiosInstance.delete(`/es3afni/${id}`);
}
