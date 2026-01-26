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

// جلب قائمة إعلانات الكنز
export const getKenzList = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  ownerId?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  createdAfter?: string;
  createdBefore?: string;
}): Promise<KenzListResponse> => {
  try {
    const response = await api.get('/admin/kenz', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة إعلانات الكنز:', error);
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
