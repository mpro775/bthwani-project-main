// src/features/arabon/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  ArabonItem,
  CreateArabonPayload,
  UpdateArabonPayload,
  ArabonFilters,
  ArabonListResponse
} from './types';

/**
 * إنشاء عربون جديد
 */
export async function createArabon(payload: CreateArabonPayload): Promise<ArabonItem> {
  const response = await axiosInstance.post('/arabon', payload);
  return response.data;
}

/**
 * استرجاع قائمة العربونات
 */
export async function getArabonList(params?: {
  cursor?: string;
  limit?: number;
} & ArabonFilters): Promise<ArabonListResponse> {
  const response = await axiosInstance.get('/arabon', { params });
  return response.data;
}

/**
 * استرجاع عربون واحد
 */
export async function getArabon(id: string): Promise<ArabonItem> {
  const response = await axiosInstance.get(`/arabon/${id}`);
  return response.data;
}

/**
 * تحديث عربون
 */
export async function updateArabon(id: string, payload: UpdateArabonPayload): Promise<ArabonItem> {
  const response = await axiosInstance.patch(`/arabon/${id}`, payload);
  return response.data;
}

/**
 * حذف عربون
 */
export async function deleteArabon(id: string): Promise<void> {
  await axiosInstance.delete(`/arabon/${id}`);
}
