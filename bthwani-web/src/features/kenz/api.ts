// src/features/kenz/api.ts
import axiosInstance from '../../api/axios-instance';
import type {
  KenzItem,
  CreateKenzPayload,
  UpdateKenzPayload,
  KenzListResponse,
} from "./types";

/**
 * إنشاء إعلان سوق جديد
 */
export async function createKenz(payload: CreateKenzPayload): Promise<KenzItem> {
  const response = await axiosInstance.post('/kenz', payload);
  return response.data;
}

export type KenzSortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

/**
 * استرجاع قائمة الإعلانات - مع دعم البحث والترتيب
 */
export async function getKenzList(params?: {
  cursor?: string;
  limit?: number;
  category?: string;
  city?: string;
  status?: string;
  condition?: 'new' | 'used' | 'refurbished';
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  search?: string;
  sort?: KenzSortOption;
}): Promise<KenzListResponse> {
  const response = await axiosInstance.get("/kenz", { params });
  const data = response.data;
  return Array.isArray(data) ? { items: data, nextCursor: undefined } : data;
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

/**
 * تعليم الإعلان كمباع (للمالك فقط، يتطلب مصادقة)
 */
export async function markKenzAsSold(id: string): Promise<KenzItem> {
  const response = await axiosInstance.patch(`/kenz/${id}/sold`);
  return response.data;
}

export interface ReportKenzPayload {
  reason: string;
  notes?: string;
}

/**
 * الإبلاغ عن إعلان (يتطلب مصادقة، مرة واحدة لكل إعلان)
 */
export async function reportKenz(id: string, payload: ReportKenzPayload): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.post(`/kenz/${id}/report`, payload);
  return response.data;
}

/** شجرة فئات كنز (للفلاتر والنشر) */
export interface KenzCategoryTreeItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  order: number;
  children?: KenzCategoryTreeItem[];
}

export async function getKenzCategoriesTree(): Promise<KenzCategoryTreeItem[]> {
  const response = await axiosInstance.get("/kenz/categories");
  return response.data ?? [];
}

/** إضافة إعلان للمفضلة (يتطلب مصادقة) */
export async function addKenzFavorite(kenzId: string): Promise<{ success: boolean }> {
  const response = await axiosInstance.post(`/kenz/${kenzId}/favorite`);
  return response.data;
}

/** إزالة إعلان من المفضلة (يتطلب مصادقة) */
export async function removeKenzFavorite(kenzId: string): Promise<{ success: boolean }> {
  const response = await axiosInstance.delete(`/kenz/${kenzId}/favorite`);
  return response.data;
}

/** قائمة إعلاناتي المفضلة (يتطلب مصادقة) */
export async function getKenzFavorites(params?: { cursor?: string }): Promise<KenzListResponse> {
  const response = await axiosInstance.get("/kenz/favorites", { params });
  const data = response.data;
  return Array.isArray(data) ? { items: data, nextCursor: undefined } : data;
}
