import axios from "./axios";

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
  user: any;
  driver?: any;
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

export interface UpdateStatusPayload {
  status: string;
  note?: string;
}

// ==================== API Functions ====================

/**
 * جلب مهمات السائق من أخدمني
 * @param status فلتر حسب الحالة (اختياري)
 */
export const getMyDriverErrands = async (
  status?: string
): Promise<ErrandOrder[]> => {
  const params = status ? { status } : {};
  const response = await axios.get("/akhdimni/driver/my-errands", { params });
  return response.data;
};

/**
 * تحديث حالة المهمة
 * @param id معرف المهمة
 * @param payload بيانات التحديث
 */
export const updateErrandStatus = async (
  id: string,
  payload: UpdateStatusPayload
): Promise<ErrandOrder> => {
  const response = await axios.patch(`/akhdimni/errands/${id}/status`, payload);
  return response.data;
};

/**
 * جلب تفاصيل مهمة محددة
 * @param id معرف المهمة
 */
export const getErrandDetails = async (id: string): Promise<ErrandOrder> => {
  const response = await axios.get(`/akhdimni/errands/${id}`);
  return response.data;
};

// ==================== Helper Functions ====================

/**
 * الحالات المتاحة للسائق
 */
export const ERRAND_STATUSES = {
  ASSIGNED: "assigned",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
} as const;

/**
 * أسماء الحالات بالعربية
 */
export const ERRAND_STATUS_LABELS: Record<string, string> = {
  created: "تم الإنشاء",
  assigned: "تم التعيين",
  picked_up: "تم الاستلام",
  in_transit: "في الطريق",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

/**
 * ألوان الحالات
 */
export const ERRAND_STATUS_COLORS: Record<string, string> = {
  created: "#6c757d",
  assigned: "#0dcaf0",
  picked_up: "#ffc107",
  in_transit: "#0d6efd",
  delivered: "#198754",
  cancelled: "#dc3545",
};

/**
 * الحصول على الإجراء التالي حسب الحالة الحالية
 */
export const getNextAction = (
  currentStatus: string
): { status: string; label: string } | null => {
  switch (currentStatus) {
    case "assigned":
      return { status: "picked_up", label: "تأكيد الاستلام" };
    case "picked_up":
      return { status: "in_transit", label: "في الطريق للتسليم" };
    case "in_transit":
      return { status: "delivered", label: "تأكيد التسليم" };
    default:
      return null;
  }
};

