import axiosInstance from "@/utils/api/axiosInstance";

export interface AppOrder {
  _id: string;
  vendor?: { _id: string; fullName: string };
  store?: { _id: string; name: string };
  driver?: { _id: string; fullName: string; phone: string };
  items: Array<{
    product: { _id: string; name: string };
    quantity: number;
    price: number;
  }>;
  status: string;
  totalPrice: number;
  deliveryFee: number;
  address: {
    label: string;
    city: string;
    street: string;
    location?: { lat: number; lng: number };
  };
  paymentMethod: string;
  createdAt: string;
}

// ==================== User Order Operations ====================

// Create order
export const createOrder = async (orderData: {
  items: Array<{ product: string; quantity: number; price: number }>;
  address: {
    label: string;
    city: string;
    street: string;
    location?: { lat: number; lng: number };
  };
  paymentMethod: string;
  price: number;
  deliveryFee: number;
  companyShare: number;
  platformShare: number;
  walletUsed?: number;
}) => {
  const { data } = await axiosInstance.post<AppOrder>("/delivery/order", orderData);
  return data;
};

// Get user orders
export const getUserOrders = async (userId: string, cursor?: string, limit = 20) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  
  const { data } = await axiosInstance.get(`/delivery/order/user/${userId}`, { params });
  
  // Support both formats: { data: [...], pagination: {...} } or [...]
  return data?.data || data || [];
};

// Get my orders (current user)
export const getMyOrders = async (cursor?: string, limit = 20) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  
  const { data } = await axiosInstance.get("/delivery/order/my-orders", { params });
  
  return data?.data || data || [];
};

// Get order details
export const getOrderDetails = async (orderId: string) => {
  const { data } = await axiosInstance.get<AppOrder>(`/delivery/order/${orderId}`);
  return data;
};

// ==================== Order Actions ====================

// Cancel order
export const cancelOrder = async (orderId: string, reason: string) => {
  const { data } = await axiosInstance.post(`/delivery/order/${orderId}/cancel`, {
    reason,
  });
  return data;
};

// Return order
export const returnOrder = async (orderId: string, reason: string) => {
  const { data } = await axiosInstance.post(`/delivery/order/${orderId}/return`, {
    reason,
  });
  return data;
};

// Rate order
export const rateOrder = async (orderId: string, rating: number, comment?: string) => {
  const { data } = await axiosInstance.post(`/delivery/order/${orderId}/rate`, {
    rating,
    comment,
  });
  return data;
};

// Repeat order
export const repeatOrder = async (orderId: string) => {
  const { data } = await axiosInstance.post<AppOrder>(
    `/delivery/order/${orderId}/repeat`
  );
  return data;
};

// ==================== Tracking & Status ====================

// Track order
export const trackOrder = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/${orderId}/tracking`);
  return data;
};

// Live tracking
export const getLiveTracking = async (orderId: string) => {
  const { data } = await axiosInstance.get(
    `/delivery/order/${orderId}/live-tracking`
  );
  return data;
};

// Get driver ETA
export const getDriverETA = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/${orderId}/driver-eta`);
  return data;
};

// Get route history
export const getRouteHistory = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/${orderId}/route-history`);
  return data;
};

// Get delivery timeline
export const getDeliveryTimeline = async (orderId: string) => {
  const { data } = await axiosInstance.get(
    `/delivery/order/${orderId}/delivery-timeline`
  );
  return data;
};

// Get proof of delivery
export const getProofOfDelivery = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/${orderId}/pod`);
  return data;
};

// Get order notes
export const getOrderNotes = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/${orderId}/notes`);
  return data;
};

// Get public order status (no auth)
export const getPublicOrderStatus = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/public/${orderId}/status`);
  return data;
};

