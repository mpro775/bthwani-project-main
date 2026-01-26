// src/features/maarouf/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  MaaroufItem,
  CreateMaaroufPayload,
  UpdateMaaroufPayload,
  MaaroufFilters,
  MaaroufListResponse
} from './types';

/**
 * إنشاء إعلان معروف جديد
 */
export async function createMaarouf(payload: CreateMaaroufPayload): Promise<MaaroufItem> {
  const response = await axiosInstance.post('/maarouf', payload);
  return response.data;
}

/**
 * استرجاع قائمة إعلانات معروف
 */
export async function getMaaroufList(params?: {
  cursor?: string;
  limit?: number;
} & MaaroufFilters): Promise<MaaroufListResponse> {
  const response = await axiosInstance.get('/maarouf', { params });
  return response.data;
}

/**
 * استرجاع إعلان معروف واحد
 */
export async function getMaarouf(id: string): Promise<MaaroufItem> {
  const response = await axiosInstance.get(`/maarouf/${id}`);
  return response.data;
}

/**
 * تحديث إعلان معروف
 */
export async function updateMaarouf(id: string, payload: UpdateMaaroufPayload): Promise<MaaroufItem> {
  const response = await axiosInstance.patch(`/maarouf/${id}`, payload);
  return response.data;
}

/**
 * حذف إعلان معروف
 */
export async function deleteMaarouf(id: string): Promise<void> {
  await axiosInstance.delete(`/maarouf/${id}`);
}
