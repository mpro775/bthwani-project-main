import { api } from '../services/api';

// أنواع البيانات
export interface KenzItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata: Record<string, any>;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  /** نشر بالنيابة: رقم الهاتف */
  postedOnBehalfOfPhone?: string;
  /** نشر بالنيابة: المستخدم (مُعبأ من الباك اند) */
  postedOnBehalfOfUserId?: string | { _id: string; name?: string; phone?: string };
  isAuction?: boolean;
  auctionEndAt?: string;
  startingPrice?: number;
  winnerId?: string | { _id: string; fullName?: string; phone?: string };
  winningBidAmount?: number;
}

export interface KenzStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface KenzListResponse {
  items: KenzItem[];
  nextCursor?: string;
}

export interface UpdateKenzStatusRequest {
  status: string;
  notes?: string;
}

export type KenzSortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

export type KenzCondition = 'new' | 'used' | 'refurbished';

export type KenzDeliveryOption = 'meetup' | 'delivery' | 'both';

// جلب قائمة إعلانات الكنز
export const getKenzList = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  ownerId?: string;
  category?: string;
  condition?: KenzCondition;
  deliveryOption?: KenzDeliveryOption;
  priceMin?: number;
  priceMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  sort?: KenzSortOption;
  acceptsEscrow?: boolean;
  isAuction?: boolean;
}): Promise<KenzListResponse> => {
  try {
    const response = await api.get('/admin/kenz', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة إعلانات الكنز:', error);
    throw error;
  }
};

export interface KenzBidItem {
  _id: string;
  kenzId: string;
  bidderId: string | { _id: string; fullName?: string; phone?: string };
  amount: number;
  createdAt: string;
}

// جلب مزايدات إعلان مزاد
export const getKenzBids = async (kenzId: string): Promise<{
  items: KenzBidItem[];
  nextCursor?: string | null;
  highestBid?: number | null;
  bidCount?: number;
}> => {
  try {
    const response = await api.get(`/admin/kenz/${kenzId}/bids`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب المزايدات:', error);
    throw error;
  }
};

// جلب إعلان كنز واحد
export const getKenz = async (id: string): Promise<KenzItem> => {
  try {
    const response = await api.get(`/admin/kenz/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إعلان الكنز:', error);
    throw error;
  }
};

// تحديث حالة إعلان الكنز
export const updateKenzStatus = async (id: string, data: UpdateKenzStatusRequest): Promise<KenzItem> => {
  try {
    const response = await api.patch(`/admin/kenz/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة إعلان الكنز:', error);
    throw error;
  }
};

// حذف إعلان كنز
export const deleteKenz = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/kenz/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف إعلان الكنز:', error);
    throw error;
  }
};

// جلب إحصائيات الكنز
export const getKenzStats = async (): Promise<KenzStats> => {
  try {
    const response = await api.get('/admin/kenz/stats/overview');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الكنز:', error);
    throw error;
  }
};

export interface KenzReportItem {
  _id: string;
  kenzId: { _id: string; title?: string; status?: string; ownerId?: string };
  reporterId: { _id: string; name?: string; email?: string; phone?: string };
  reason: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface KenzReportsResponse {
  items: KenzReportItem[];
  nextCursor?: string;
}

// جلب قائمة بلاغات كنز
export const getKenzReports = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
}): Promise<KenzReportsResponse> => {
  try {
    const response = await api.get('/admin/kenz/reports', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب بلاغات الكنز:', error);
    throw error;
  }
};

// ========== فئات كنز (شجرة) ==========
export interface KenzCategoryItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  order: number;
  children?: KenzCategoryItem[];
}

export interface KenzCategoryFlat {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  order: number;
}

export const getKenzCategoriesTree = async (): Promise<KenzCategoryItem[]> => {
  try {
    const response = await api.get('/kenz/categories');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب شجرة فئات الكنز:', error);
    throw error;
  }
};

export const getKenzCategoriesList = async (): Promise<KenzCategoryFlat[]> => {
  try {
    const response = await api.get('/admin/kenz/categories');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة فئات الكنز:', error);
    throw error;
  }
};

export const getKenzCategoriesTreeAdmin = async (): Promise<KenzCategoryItem[]> => {
  try {
    const response = await api.get('/admin/kenz/categories/tree');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب شجرة فئات الكنز (أدمن):', error);
    throw error;
  }
};

export const createKenzCategory = async (data: {
  nameAr: string;
  nameEn: string;
  slug: string;
  parentId?: string | null;
  order?: number;
}): Promise<KenzCategoryFlat> => {
  try {
    const response = await api.post('/admin/kenz/categories', data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إنشاء فئة الكنز:', error);
    throw error;
  }
};

export const updateKenzCategory = async (
  id: string,
  data: Partial<{ nameAr: string; nameEn: string; slug: string; parentId: string | null; order: number }>
): Promise<KenzCategoryFlat> => {
  try {
    const response = await api.patch(`/admin/kenz/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث فئة الكنز:', error);
    throw error;
  }
};

export const deleteKenzCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/admin/kenz/categories/${id}`);
  } catch (error) {
    console.error('خطأ في حذف فئة الكنز:', error);
    throw error;
  }
};

// ========== ترويج الإعلانات (Boost) ==========
export type KenzBoostType = 'highlight' | 'pin' | 'top';
export type KenzBoostStatus = 'active' | 'expired' | 'cancelled';

export interface KenzBoostItem {
  _id: string;
  kenzId: { _id: string; title?: string; status?: string; ownerId?: string };
  startDate: string;
  endDate: string;
  boostType: KenzBoostType;
  createdBy?: { _id: string; name?: string; email?: string };
  status: KenzBoostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface KenzBoostsResponse {
  items: KenzBoostItem[];
  nextCursor?: string;
}

export const getKenzBoosts = async (params?: {
  cursor?: string;
  limit?: number;
  status?: KenzBoostStatus;
  kenzId?: string;
}): Promise<KenzBoostsResponse> => {
  try {
    const response = await api.get('/admin/kenz/boosts', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب ترويجات الكنز:', error);
    throw error;
  }
};

export const createKenzBoost = async (data: {
  kenzId: string;
  startDate: string;
  endDate: string;
  boostType?: KenzBoostType;
}): Promise<KenzBoostItem> => {
  try {
    const response = await api.post('/admin/kenz/boosts', data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إنشاء ترويج الكنز:', error);
    throw error;
  }
};

export const cancelKenzBoost = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.patch(`/admin/kenz/boosts/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('خطأ في إلغاء ترويج الكنز:', error);
    throw error;
  }
};

// ========== صفقات الإيكرو (للأدمن) ==========
export type KenzDealStatus = 'pending' | 'completed' | 'cancelled';

export interface KenzDealItem {
  _id: string;
  kenzId: { _id: string; title?: string; price?: number; status?: string };
  buyerId: { _id: string; fullName?: string; phone?: string };
  sellerId: { _id: string; fullName?: string; phone?: string };
  amount: number;
  status: KenzDealStatus;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface KenzDealsResponse {
  items: KenzDealItem[];
  nextCursor?: string;
}

export const getKenzDeals = async (params?: {
  cursor?: string;
  limit?: number;
  status?: KenzDealStatus;
}): Promise<KenzDealsResponse> => {
  try {
    const response = await api.get('/admin/kenz/deals', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب صفقات كنز:', error);
    throw error;
  }
};
