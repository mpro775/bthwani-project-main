import { api } from '../services/api';

// أنواع البيانات
export interface KawaderItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  offerType?: 'job' | 'service';
  jobType?: 'full_time' | 'part_time' | 'remote' | null;
  location?: string;
  salary?: number;
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

export interface KawaderStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface KawaderListResponse {
  items: KawaderItem[];
  nextCursor?: string;
}

export interface KawaderApplicationItem {
  _id: string;
  kawaderId: string;
  userId: string | { _id: string; name?: string; email?: string; phone?: string };
  coverNote?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}

export interface UpdateKawaderStatusRequest {
  status: string;
  notes?: string;
}

// جلب قائمة الكوادر
export const getKawaderList = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  ownerId?: string;
  budgetMin?: number;
  budgetMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  offerType?: string;
  jobType?: string;
  location?: string;
}): Promise<KawaderListResponse> => {
  try {
    const response = await api.get('/admin/kawader', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة الكوادر:', error);
    throw error;
  }
};

// جلب تقديمات عرض كادر واحد (باستخدام مسار الكوادر العام)
export const getKawaderApplicationsAdmin = async (
  kawaderId: string,
): Promise<KawaderApplicationItem[]> => {
  try {
    const response = await api.get(`/kawader/${kawaderId}/applications`);
    const raw = response.data;
    const data = raw?.data ?? raw;
    return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('خطأ في جلب تقديمات عرض الكادر:', error);
    throw error;
  }
};

// جلب عرض كادر واحد
export const getKawader = async (id: string): Promise<KawaderItem> => {
  try {
    const response = await api.get(`/admin/kawader/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب عرض الكادر:', error);
    throw error;
  }
};

// تحديث حالة عرض الكادر
export const updateKawaderStatus = async (id: string, data: UpdateKawaderStatusRequest): Promise<KawaderItem> => {
  try {
    const response = await api.patch(`/admin/kawader/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة عرض الكادر:', error);
    throw error;
  }
};

// حذف عرض كادر
export const deleteKawader = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/kawader/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف عرض الكادر:', error);
    throw error;
  }
};

// جلب إحصائيات الكوادر
export const getKawaderStats = async (): Promise<KawaderStats> => {
  try {
    const response = await api.get('/admin/kawader/stats/overview');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الكوادر:', error);
    throw error;
  }
};
