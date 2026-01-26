import axios from "./axios";

export interface DriverOrder {
  _id: string;
  user: { fullName: string; phone: string };
  store?: { name: string };
  items: Array<{
    product: { name: string };
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
  assignedAt?: string;
  createdAt: string;
}

// ==================== Driver Order Operations ====================

// Get available orders (orders ready for pickup)
export const getAvailableOrders = async () => {
  const response = await axios.get("/drivers/orders/available");
  return response.data;
};

// Accept order
export const acceptOrder = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/accept`);
  return response.data;
};

// Reject order
export const rejectOrder = async (orderId: string, reason: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/reject`, { 
    reason 
  });
  return response.data;
};

// Start delivery
export const startDelivery = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/start-delivery`);
  return response.data;
};

// Complete delivery
export const completeDelivery = async (orderId: string) => {
  const response = await axios.post(`/drivers/orders/${orderId}/complete`);
  return response.data;
};

// Get driver orders history
export const getOrdersHistory = async (cursor?: string, limit = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());
  
  const response = await axios.get(`/drivers/orders/history?${params.toString()}`);
  return response.data;
};

// ==================== Order Tracking ====================

// Update driver location during delivery
export const updateLocation = async (orderId: string, lat: number, lng: number) => {
  const response = await axios.post(`/delivery/order/${orderId}/update-location`, {
    lat,
    lng,
  });
  return response.data;
};

// Set proof of delivery
export const setProofOfDelivery = async (
  orderId: string,
  imageUrl: string,
  signature?: string,
  notes?: string
) => {
  const response = await axios.post(`/delivery/order/${orderId}/pod`, {
    imageUrl,
    signature,
    notes,
  });
  return response.data;
};

// Get order details
export const getOrderDetails = async (orderId: string) => {
  const response = await axios.get<DriverOrder>(`/delivery/order/${orderId}`);
  return response.data;
};

export default {
  getAvailableOrders,
  acceptOrder,
  rejectOrder,
  startDelivery,
  completeDelivery,
  getOrdersHistory,
  updateLocation,
  setProofOfDelivery,
  getOrderDetails,
};
