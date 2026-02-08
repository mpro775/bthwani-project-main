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
  images?: string[];
  contactPhone?: string;
  socialLinks?: { whatsapp?: string; facebook?: string; instagram?: string };
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: 'hour' | 'day' | 'week';
  pricePerPeriod?: number;
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

// ==================== الحجوزات (المرحلة 5) ====================

export interface BookingItem {
  _id: string;
  userId: string | { _id: string; fullName?: string; phone?: string };
  arabonId: string;
  slotId: string | { _id: string; datetime?: string; durationMinutes?: number };
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  depositAmount: number;
  createdAt: string;
}

export const getArabonBookings = async (arabonId: string): Promise<{
  data: BookingItem[];
  nextCursor?: string;
  hasMore?: boolean;
}> => {
  try {
    const response = await api.get(`/admin/arabon/${arabonId}/bookings`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب حجوزات العربون:', error);
    throw error;
  }
};

export interface BookingsKpis {
  paidBookingsCount: number;
  conversionRate: number;
  noShowRate: number;
  calendarAccuracy: number;
  byStatus: { confirmed: number; completed: number; cancelled: number; no_show: number };
}

export const getBookingsKpis = async (arabonId?: string): Promise<BookingsKpis> => {
  try {
    const params = arabonId ? { arabonId } : undefined;
    const response = await api.get('/admin/arabon/bookings/kpis', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب مؤشرات الحجوزات:', error);
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: 'completed' | 'cancelled' | 'no_show'
): Promise<BookingItem> => {
  try {
    const response = await api.patch(`/admin/arabon/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة الحجز:', error);
    throw error;
  }
};
