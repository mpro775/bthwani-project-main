// src/features/kenz/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  KenzItem,
  CreateKenzPayload,
  UpdateKenzPayload,
  KenzFilters,
  KenzListResponse
} from './types';

/**
 * إنشاء إعلان سوق جديد
 */
export async function createKenz(payload: CreateKenzPayload): Promise<KenzItem> {
  const response = await axiosInstance.post('/kenz', payload);
  return response.data;
}

/**
 * استرجاع قائمة الإعلانات
 */
export async function getKenzList(params?: {
  cursor?: string;
  limit?: number;
} & KenzFilters): Promise<KenzListResponse> {
  const response = await axiosInstance.get('/kenz', { params });
  return response.data;
}

/**
 * استرجاع إعلان واحد
 */
export async function getKenz(id: string): Promise<KenzItem> {
  const response = await axiosInstance.get(`/kenz/${id}`);
  return response.data;
}

/**
 * تحديث إعلان
 */
export async function updateKenz(id: string, payload: UpdateKenzPayload): Promise<KenzItem> {
  const response = await axiosInstance.patch(`/kenz/${id}`, payload);
  return response.data;
}

/**
 * حذف إعلان
 */
export async function deleteKenz(id: string): Promise<void> {
  await axiosInstance.delete(`/kenz/${id}`);
}
