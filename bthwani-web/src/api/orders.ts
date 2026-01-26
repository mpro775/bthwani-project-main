import axiosInstance from "./axios-instance";
import { getAuthHeader } from "./auth";
import type { Order } from "../types";

// ==================== User Order Operations ====================

// Create order
export const createOrder = async (orderData: {
  items: Array<{ productId: string; quantity: number; price: number }>;
  address: {
    label: string;
    city: string;
    street: string;
    location?: { lat: number; lng: number };
  };
  deliveryTime?: string;
  paymentMethod: string;
  price: number;
  deliveryFee: number;
  companyShare: number;
  platformShare: number;
}): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<Order>(
    "/delivery/order",
    orderData,
    { headers }
  );
  return response.data;
};

// Get user orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<{ data: Order[] } | Order[]>(
    `/delivery/order/user/${userId}`,
    { headers }
  );
  
  // Support both response formats
  const data = response.data;
  return Array.isArray(data) ? data : data.data || [];
};

// Get my orders (current user)
export const getMyOrders = async (): Promise<Order[]> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<{ data: Order[] } | Order[]>(
    "/delivery/order/my-orders",
    { headers }
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.data || [];
};

// Get order details
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<Order>(
    `/delivery/order/${orderId}`,
    { headers }
  );
  return response.data;
};

// ==================== Order Actions ====================

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<Order>(
    `/delivery/order/${orderId}/status`,
    { status },
    { headers }
  );
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId: string, reason: string): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<Order>(
    `/delivery/order/${orderId}/cancel`,
    { reason },
    { headers }
  );
  return response.data;
};

// Return order
export const returnOrder = async (orderId: string, reason: string): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<Order>(
    `/delivery/order/${orderId}/return`,
    { reason },
    { headers }
  );
  return response.data;
};

// Rate order
export const rateOrder = async (
  orderId: string,
  rating: number,
  comment?: string
): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<Order>(
    `/delivery/order/${orderId}/rate`,
    { rating, comment },
    { headers }
  );
  return response.data;
};

// Repeat order
export const repeatOrder = async (orderId: string): Promise<Order> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<Order>(
    `/delivery/order/${orderId}/repeat`,
    {},
    { headers }
  );
  return response.data;
};

// ==================== Tracking & Status ====================

// Track order
export const trackOrder = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/tracking`,
    { headers }
  );
  return response.data;
};

// Live tracking
export const getLiveTracking = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/live-tracking`,
    { headers }
  );
  return response.data;
};

// Get driver ETA
export const getDriverETA = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/driver-eta`,
    { headers }
  );
  return response.data;
};

// Get route history
export const getRouteHistory = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/route-history`,
    { headers }
  );
  return response.data;
};

// Get delivery timeline
export const getDeliveryTimeline = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/delivery-timeline`,
    { headers }
  );
  return response.data;
};

// Get proof of delivery
export const getProofOfDelivery = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/pod`,
    { headers }
  );
  return response.data;
};

// Get order notes
export const getOrderNotes = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(
    `/delivery/order/${orderId}/notes`,
    { headers }
  );
  return response.data;
};

// Get public order status (no auth required)
export const getPublicOrderStatus = async (orderId: string) => {
  const response = await axiosInstance.get(
    `/delivery/order/public/${orderId}/status`
  );
  return response.data;
};

export default {
  createOrder,
  getUserOrders,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  rateOrder,
  repeatOrder,
  trackOrder,
  getLiveTracking,
  getDriverETA,
  getRouteHistory,
  getDeliveryTimeline,
  getProofOfDelivery,
  getOrderNotes,
  getPublicOrderStatus,
};
