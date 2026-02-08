import { api } from '../services/api';

// أنواع البيانات
export interface AmaniDriver {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  role?: string;
  isFemaleDriver?: boolean;
  isAvailable?: boolean;
}

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
  driver?: AmaniDriver | string;
  assignedAt?: string;
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
  status?: string;
}): Promise<{
  items: AmaniItem[];
  nextCursor?: string;
}> => {
  try {
    const response = await api.get('/admin/amani', {
      params: { cursor: params?.cursor, limit: params?.limit, status: params?.status },
    });
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

// تعيين سائق للطلب
export const assignAmaniDriver = async (
  amaniId: string,
  driverId: string,
  note?: string
): Promise<AmaniItem> => {
  try {
    const response = await api.post(`/admin/amani/${amaniId}/assign-driver`, {
      driverId,
      note,
    });
    return response.data;
  } catch (error) {
    console.error('خطأ في تعيين السائق:', error);
    throw error;
  }
};

// جلب السائقات (لطلبات womenOnly)
export const getWomenDrivers = async (): Promise<AmaniDriver[]> => {
  try {
    const response = await api.get('/admin/drivers', {
      params: { role: 'women_driver', isAvailable: true, page: 1, limit: 100 },
    });
    return response.data?.data ?? response.data?.drivers ?? [];
  } catch (error) {
    console.error('خطأ في جلب السائقات:', error);
    throw error;
  }
};

// جلب جميع السائقين المتاحين (للطلبات العادية)
export const getAvailableDrivers = async (): Promise<AmaniDriver[]> => {
  try {
    const response = await api.get('/admin/drivers', {
      params: { isAvailable: true, page: 1, limit: 100 },
    });
    return response.data?.data ?? response.data?.drivers ?? [];
  } catch (error) {
    console.error('خطأ في جلب السائقين:', error);
    throw error;
  }
};

// إعدادات أسعار أماني
export interface AmaniPricingSettings {
  baseFee: number;
  perKm: number;
}

export const getAmaniPricing = async (): Promise<AmaniPricingSettings> => {
  const response = await api.get('/admin/amani/pricing');
  return response.data;
};

export const updateAmaniPricing = async (
  settings: AmaniPricingSettings
): Promise<AmaniPricingSettings> => {
  const response = await api.patch('/admin/amani/pricing', settings);
  return response.data;
};
