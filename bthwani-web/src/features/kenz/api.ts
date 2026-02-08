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
  acceptsEscrow?: boolean;
  isAuction?: boolean;
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

// ========== صفقات الإيكرو ==========
export type KenzDealStatus = 'pending' | 'completed' | 'cancelled';

export interface KenzDealItem {
  _id: string;
  kenzId: string | { _id: string; title?: string; price?: number; images?: string[]; status?: string };
  buyerId: string | { _id: string; fullName?: string; phone?: string };
  sellerId: string | { _id: string; fullName?: string; phone?: string };
  amount: number;
  status: KenzDealStatus;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface KenzDealsResponse {
  items: KenzDealItem[];
  nextCursor?: string | null;
}

/** شراء بالإيكرو (يتطلب مصادقة) */
export async function buyWithEscrow(kenzId: string, amount: number): Promise<{ success: boolean; deal: KenzDealItem; message?: string }> {
  const response = await axiosInstance.post(`/kenz/${kenzId}/buy-with-escrow`, { amount });
  return response.data;
}

/** قائمة صفقاتي (يتطلب مصادقة) */
export async function getMyKenzDeals(params?: {
  cursor?: string;
  role?: 'buyer' | 'seller';
}): Promise<KenzDealsResponse> {
  const response = await axiosInstance.get("/kenz/deals", { params });
  const data = response.data;
  return Array.isArray(data?.items) ? data : { items: data?.items ?? [], nextCursor: data?.nextCursor };
}

/** تأكيد الاستلام (للمشتري فقط) */
export async function confirmKenzDealReceived(dealId: string): Promise<{ success: boolean; deal: KenzDealItem }> {
  const response = await axiosInstance.post(`/kenz/deals/${dealId}/confirm-received`);
  return response.data;
}

/** إلغاء صفقة (المشتري أو البائع) */
export async function cancelKenzDeal(dealId: string): Promise<{ success: boolean; deal: KenzDealItem }> {
  const response = await axiosInstance.post(`/kenz/deals/${dealId}/cancel`);
  return response.data;
}

// ========== المزادات ==========
export interface KenzBidItem {
  _id: string;
  kenzId: string;
  bidderId: string | { _id: string; fullName?: string; phone?: string };
  amount: number;
  createdAt: string;
}

export interface KenzBidsResponse {
  items: KenzBidItem[];
  nextCursor?: string | null;
  highestBid?: number | null;
  bidCount?: number;
}

/** إضافة مزايدة (يتطلب مصادقة) */
export async function placeBid(kenzId: string, amount: number): Promise<{ success: boolean; bid: KenzBidItem; message?: string }> {
  const response = await axiosInstance.post(`/kenz/${kenzId}/bid`, { amount });
  return response.data;
}

/** جلب مزايدات إعلان مزاد */
export async function getKenzBids(kenzId: string, cursor?: string): Promise<KenzBidsResponse> {
  const response = await axiosInstance.get(`/kenz/${kenzId}/bids`, { params: cursor ? { cursor } : {} });
  return response.data;
}
