import { api } from '../services/api';

// أنواع البيانات
export interface SanadItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: 'specialist' | 'emergency' | 'charity';
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

export interface SanadStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  specialist: number;
  emergency: number;
  charity: number;
}

export interface SanadListResponse {
  items: SanadItem[];
  nextCursor?: string;
}

export interface UpdateSanadStatusRequest {
  status: string;
  notes?: string;
}

// جلب قائمة طلبات الصناد
export const getSanadList = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  kind?: string;
  ownerId?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}): Promise<SanadListResponse> => {
  try {
    const response = await api.get('/admin/sanad', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة طلبات الصناد:', error);
    throw error;
  }
};

// جلب طلب صناد واحد
export const getSanad = async (id: string): Promise<SanadItem> => {
  try {
    const response = await api.get(`/admin/sanad/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب طلب الصناد:', error);
    throw error;
  }
};

// تحديث حالة طلب الصناد
export const updateSanadStatus = async (id: string, data: UpdateSanadStatusRequest): Promise<SanadItem> => {
  try {
    const response = await api.patch(`/admin/sanad/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة طلب الصناد:', error);
    throw error;
  }
};

// حذف طلب صناد
export const deleteSanad = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/sanad/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف طلب الصناد:', error);
    throw error;
  }
};

// جلب إحصائيات الصناد
export const getSanadStats = async (): Promise<SanadStats> => {
  try {
    const response = await api.get('/admin/sanad/stats/overview');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الصناد:', error);
    throw error;
  }
};
