import { api } from '../services/api';

// أنواع البيانات
export interface ArabonItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata: Record<string, any>;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateArabonStatusRequest {
  status: string;
}

// جلب قائمة العربون
export const getArabonList = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{
  items: ArabonItem[];
  nextCursor?: string;
}> => {
  try {
    const response = await api.get('/admin/arabon', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة العربون:', error);
    throw error;
  }
};

// جلب طلب عربون واحد
export const getArabon = async (id: string): Promise<ArabonItem> => {
  try {
    const response = await api.get(`/admin/arabon/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب طلب العربون:', error);
    throw error;
  }
};

// تحديث حالة طلب العربون
export const updateArabonStatus = async (id: string, status: string): Promise<ArabonItem> => {
  try {
    const response = await api.patch(`/admin/arabon/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة طلب العربون:', error);
    throw error;
  }
};

// حذف طلب عربون
export const deleteArabon = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/arabon/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف طلب العربون:', error);
    throw error;
  }
};
