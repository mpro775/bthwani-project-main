import axiosInstance from "./axios-instance";
import { getAuthHeader } from "./auth";

interface UtilityOrderRequest {
  title: string;
  description: string;
  category: string;
  budget?: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  images?: string[];
  urgency: "low" | "medium" | "high";
  scheduleDate?: string;
}

interface UtilityOrderResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  estimatedCost?: number;
}

// Create utility order (errand service)
export const createUtilityOrder = async (
  orderData: UtilityOrderRequest
): Promise<UtilityOrderResponse> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<UtilityOrderResponse>(
    "/utility/order",
    orderData,
    { headers }
  );
  return response.data;
};

// Get utility orders for user
export const getUserUtilityOrders = async (
  userId: string
): Promise<UtilityOrderResponse[]> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<UtilityOrderResponse[]>(
    `/utility/orders/user/${userId}`,
    { headers }
  );
  return response.data;
};

// Get utility order by ID
export const getUtilityOrderById = async (
  orderId: string
): Promise<UtilityOrderResponse> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<UtilityOrderResponse>(
    `/utility/order/${orderId}`,
    { headers }
  );
  return response.data;
};

// Update utility order status
export const updateUtilityOrderStatus = async (
  orderId: string,
  status: UtilityOrderResponse["status"]
): Promise<UtilityOrderResponse> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<UtilityOrderResponse>(
    `/utility/order/${orderId}/status`,
    { status },
    { headers }
  );
  return response.data;
};

// Cancel utility order
export const cancelUtilityOrder = async (orderId: string): Promise<void> => {
  const headers = await getAuthHeader();
  await axiosInstance.patch(
    `/utility/order/${orderId}/cancel`,
    {},
    { headers }
  );
};

// Rate utility order
export const rateUtilityOrder = async (
  orderId: string,
  rating: number,
  review?: string
): Promise<UtilityOrderResponse> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<UtilityOrderResponse>(
    `/utility/order/${orderId}/rate`,
    { rating, review },
    { headers }
  );
  return response.data;
};

export default {
  createUtilityOrder,
  getUserUtilityOrders,
  getUtilityOrderById,
  updateUtilityOrderStatus,
  cancelUtilityOrder,
  rateUtilityOrder,
};
