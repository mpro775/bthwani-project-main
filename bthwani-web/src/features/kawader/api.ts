// src/features/kawader/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  KawaderItem,
  CreateKawaderPayload,
  UpdateKawaderPayload,
  KawaderFilters,
  KawaderListResponse
} from './types';

/**
 * إنشاء عرض وظيفي جديد
 */
export async function createKawader(payload: CreateKawaderPayload): Promise<KawaderItem> {
  const response = await axiosInstance.post('/kawader', payload);
  return response.data;
}

/**
 * استرجاع قائمة العروض الوظيفية
 */
export async function getKawaderList(params?: {
  cursor?: string;
  limit?: number;
} & KawaderFilters): Promise<KawaderListResponse> {
  const response = await axiosInstance.get('/kawader', { params });
  return response.data;
}

/**
 * استرجاع عرض وظيفي واحد
 */
export async function getKawader(id: string): Promise<KawaderItem> {
  const response = await axiosInstance.get(`/kawader/${id}`);
  return response.data;
}

/**
 * تحديث عرض وظيفي
 */
export async function updateKawader(id: string, payload: UpdateKawaderPayload): Promise<KawaderItem> {
  const response = await axiosInstance.patch(`/kawader/${id}`, payload);
  return response.data;
}

/**
 * حذف عرض وظيفي
 */
export async function deleteKawader(id: string): Promise<void> {
  await axiosInstance.delete(`/kawader/${id}`);
}
