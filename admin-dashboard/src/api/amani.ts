import { api } from '../services/api';

// أنواع البيانات
export interface AmaniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  origin?: {
    lat: number;
    lng: number;
    address: string;
  };
  destination?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata: Record<string, any>;
  status: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAmaniStatusRequest {
  status: string;
}

// جلب قائمة الأماني
export const getAmaniList = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{
  items: AmaniItem[];
  nextCursor?: string;
}> => {
  try {
    const response = await api.get('/admin/amani', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة الأماني:', error);
    throw error;
  }
};

// جلب طلب أماني واحد
export const getAmani = async (id: string): Promise<AmaniItem> => {
  try {
    const response = await api.get(`/admin/amani/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب طلب الأماني:', error);
    throw error;
  }
};

// تحديث حالة طلب الأماني
export const updateAmaniStatus = async (id: string, status: string): Promise<AmaniItem> => {
  try {
    const response = await api.patch(`/admin/amani/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة طلب الأماني:', error);
    throw error;
  }
};

// حذف طلب أماني
export const deleteAmani = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/amani/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف طلب الأماني:', error);
    throw error;
  }
};
