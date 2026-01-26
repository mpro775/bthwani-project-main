import axiosInstance from '../utils/axios';

// ==================== Types ====================

export interface Location {
  lat: number;
  lng: number;
}

export interface ErrandPoint {
  label?: string;
  street?: string;
  city?: string;
  contactName?: string;
  phone?: string;
  location: Location;
}

export interface ErrandOrder {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  driver?: {
    _id: string;
    fullName?: string;
    phone?: string;
  };
  status: string;
  errand: {
    category: string;
    description?: string;
    size: string;
    weightKg?: number;
    pickup: ErrandPoint;
    dropoff: ErrandPoint;
    distanceKm: number;
  };
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: string;
  scheduledFor?: Date;
  notes?: string;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  rating?: {
    driver: number;
    service: number;
    comments?: string;
    ratedAt: Date;
  };
}

export interface PaginatedErrandsResult {
  data: ErrandOrder[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

// ==================== API Functions ====================

/**
 * جلب كل طلبات أخدمني مع pagination
 */
export const getAllErrands = async (params?: {
  status?: string;
  limit?: number;
  cursor?: string;
}): Promise<PaginatedErrandsResult> => {
  const response = await axiosInstance.get('/akhdimni/admin/errands', {
    params,
  });
  return response.data;
};

/**
 * تعيين سائق لمهمة
 */
export const assignDriverToErrand = async (
  errandId: string,
  driverId: string
): Promise<ErrandOrder> => {
  const response = await axiosInstance.post(
    `/akhdimni/admin/errands/${errandId}/assign-driver`,
    { driverId }
  );
  return response.data;
};

/**
 * جلب تفاصيل طلب محدد
 */
export const getErrandDetails = async (id: string): Promise<ErrandOrder> => {
  const response = await axiosInstance.get(`/akhdimni/errands/${id}`);
  return response.data;
};

/**
 * إحصائيات أخدمني
 */
export const getErrandsStats = async (params?: {
  from?: string;
  to?: string;
}): Promise<{
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  avgDeliveryFee: number;
}> => {
  // هذا endpoint يمكن إضافته لاحقاً في Backend
  // حالياً سنحسب الإحصائيات من البيانات المتوفرة
  const response = await axiosInstance.get('/akhdimni/admin/errands', {
    params: { ...params, limit: 1000 },
  });

  const errands = response.data.data || [];

  const byStatus = errands.reduce(
    (acc: Record<string, number>, errand: ErrandOrder) => {
      acc[errand.status] = (acc[errand.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const totalRevenue = errands.reduce(
    (sum: number, errand: ErrandOrder) => sum + (errand.deliveryFee || 0),
    0
  );

  return {
    total: errands.length,
    byStatus,
    totalRevenue,
    avgDeliveryFee: errands.length > 0 ? totalRevenue / errands.length : 0,
  };
};

// ==================== Constants ====================

export const ERRAND_STATUSES = {
  CREATED: 'created',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ERRAND_STATUS_LABELS: Record<string, string> = {
  created: 'تم الإنشاء',
  assigned: 'تم التعيين',
  picked_up: 'تم الاستلام',
  in_transit: 'في الطريق',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export const ERRAND_STATUS_COLORS: Record<string, string> = {
  created: '#6c757d',
  assigned: '#0dcaf0',
  picked_up: '#ffc107',
  in_transit: '#0d6efd',
  delivered: '#198754',
  cancelled: '#dc3545',
};

export const ERRAND_CATEGORIES: Record<string, string> = {
  docs: 'مستندات',
  parcel: 'طرود',
  groceries: 'مقاضي',
  carton: 'كرتون',
  food: 'ماكولات',
  fragile: 'قابل للكسر',
  other: 'أخرى',
};

export const ERRAND_SIZES: Record<string, string> = {
  small: 'صغير',
  medium: 'متوسط',
  large: 'كبير',
};

