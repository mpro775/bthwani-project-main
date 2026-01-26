import { api } from '../services/api';

// أنواع البيانات
export interface MaaroufItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: 'lost' | 'found';
  tags?: string[];
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

export interface MaaroufStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  lost: number;
  found: number;
}

export interface MaaroufListResponse {
  items: MaaroufItem[];
  nextCursor?: string;
}

export interface UpdateMaaroufStatusRequest {
  status: string;
  notes?: string;
}

// جلب قائمة إعلانات معروف
export const getMaaroufList = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  kind?: string;
  ownerId?: string;
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}): Promise<MaaroufListResponse> => {
  try {
    const response = await api.get('/admin/maarouf', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة إعلانات معروف:', error);
    throw error;
  }
};

// جلب إعلان معروف واحد
export const getMaarouf = async (id: string): Promise<MaaroufItem> => {
  try {
    const response = await api.get(`/admin/maarouf/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إعلان معروف:', error);
    throw error;
  }
};

// تحديث حالة إعلان معروف
export const updateMaaroufStatus = async (id: string, data: UpdateMaaroufStatusRequest): Promise<MaaroufItem> => {
  try {
    const response = await api.patch(`/admin/maarouf/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة إعلان معروف:', error);
    throw error;
  }
};

// حذف إعلان معروف
export const deleteMaarouf = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/maarouf/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف إعلان معروف:', error);
    throw error;
  }
};

// جلب إحصائيات معروف
export const getMaaroufStats = async (): Promise<MaaroufStats> => {
  try {
    const response = await api.get('/admin/maarouf/stats/overview');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات معروف:', error);
    throw error;
  }
};
