import axios from "./axios";

// Types
export interface AmaniOrder {
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
  metadata?: {
    passengers?: number;
    luggage?: boolean;
    specialRequests?: string;
  };
  status: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  driver?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmaniListResponse {
  items: AmaniOrder[];
  nextCursor?: string;
}

/**
 * جلب طلبات أماني المتاحة
 */
export const getAvailableAmaniOrders = async (): Promise<AmaniListResponse> => {
  const response = await axios.get("/amani", {
    params: { status: 'pending' },
  });
  return response.data;
};

/**
 * جلب طلباتي المعينة
 */
export const getMyAmaniOrders = async (
  status?: string
): Promise<AmaniOrder[]> => {
  const response = await axios.get("/amani/driver/my-orders", {
    params: status ? { status } : {},
  });
  return response.data;
};

/**
 * قبول طلب أماني (تعيين تلقائي)
 */
export const acceptAmaniOrder = async (
  amaniId: string
): Promise<AmaniOrder> => {
  const response = await axios.post(`/amani/${amaniId}/assign-driver/auto`, {});
  return response.data;
};

/**
 * تحديث حالة طلب أماني
 */
export const updateAmaniStatus = async (
  amaniId: string,
  status: string,
  note?: string
): Promise<AmaniOrder> => {
  const response = await axios.patch(`/amani/${amaniId}/status`, { status, note });
  return response.data;
};

/**
 * جلب تفاصيل طلب أماني
 */
export const getAmaniDetails = async (
  amaniId: string
): Promise<AmaniOrder> => {
  const response = await axios.get(`/amani/${amaniId}`);
  return response.data;
};
