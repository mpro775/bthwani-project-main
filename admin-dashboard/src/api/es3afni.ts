import { api } from '../services/api';

// أنواع البيانات
export interface Es3afniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  urgency?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata: Record<string, any>;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Es3afniDonorItem {
  _id: string;
  userId: string;
  bloodType: string;
  available: boolean;
  lastDonation?: string;
  city?: string;
  governorate?: string;
  createdAt?: string;
}

export interface UpdateEs3afniStatusRequest {
  status: string;
}

// جلب قائمة البلاغات
export const getEs3afniList = async (params?: {
  cursor?: string;
  limit?: number;
  bloodType?: string;
  status?: string;
  urgency?: string;
}): Promise<{
  items: Es3afniItem[];
  nextCursor?: string;
}> => {
  try {
    const response = await api.get('/admin/es3afni', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة البلاغات:', error);
    throw error;
  }
};

// جلب قائمة المتبرعين (أدمن)
export const getEs3afniDonorsList = async (params?: {
  cursor?: string;
  limit?: number;
  bloodType?: string;
  available?: boolean;
}): Promise<{
  items: Es3afniDonorItem[];
  nextCursor?: string | null;
}> => {
  try {
    const q: Record<string, string | number> = {};
    if (params?.cursor) q.cursor = params.cursor;
    if (params?.limit) q.limit = String(params.limit);
    if (params?.bloodType) q.bloodType = params.bloodType;
    if (typeof params?.available === 'boolean') q.available = params.available ? 'true' : 'false';
    const response = await api.get('/admin/es3afni/donors', { params: q });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة المتبرعين:', error);
    throw error;
  }
};

// جلب بلاغ واحد
export const getEs3afni = async (id: string): Promise<Es3afniItem> => {
  try {
    const response = await api.get(`/admin/es3afni/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب البلاغ:', error);
    throw error;
  }
};

// تحديث حالة البلاغ
export const updateEs3afniStatus = async (id: string, status: string): Promise<Es3afniItem> => {
  try {
    const response = await api.patch(`/admin/es3afni/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة البلاغ:', error);
    throw error;
  }
};

// حذف البلاغ
export const deleteEs3afni = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/es3afni/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف البلاغ:', error);
    throw error;
  }
};
