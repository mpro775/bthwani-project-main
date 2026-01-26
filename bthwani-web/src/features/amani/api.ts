// src/features/amani/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  AmaniItem,
  CreateAmaniPayload,
  UpdateAmaniPayload,
  AmaniFilters,
  AmaniListResponse
} from './types';

/**
 * إنشاء طلب نقل نسائي جديد
 */
export async function createAmani(payload: CreateAmaniPayload): Promise<AmaniItem> {
  const response = await axiosInstance.post('/amani', payload);
  return response.data;
}

/**
 * استرجاع قائمة طلبات النقل النسائي
 */
export async function getAmaniList(params?: {
  cursor?: string;
  limit?: number;
} & AmaniFilters): Promise<AmaniListResponse> {
  const response = await axiosInstance.get('/amani', { params });
  return response.data;
}

/**
 * استرجاع طلب نقل نسائي واحد
 */
export async function getAmani(id: string): Promise<AmaniItem> {
  const response = await axiosInstance.get(`/amani/${id}`);
  return response.data;
}

/**
 * تحديث طلب نقل نسائي
 */
export async function updateAmani(id: string, payload: UpdateAmaniPayload): Promise<AmaniItem> {
  const response = await axiosInstance.patch(`/amani/${id}`, payload);
  return response.data;
}

/**
 * حذف طلب نقل نسائي
 */
export async function deleteAmani(id: string): Promise<void> {
  await axiosInstance.delete(`/amani/${id}`);
}
