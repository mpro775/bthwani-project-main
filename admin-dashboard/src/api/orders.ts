import axiosInstance from "../utils/axios";

export interface Order {
  _id: string;
  user: { _id: string; fullName: string; phone: string };
  vendor?: { _id: string; fullName: string };
  store?: { _id: string; name: string };
  driver?: { _id: string; fullName: string; phone: string };
  items: Array<{
    product: string;
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
  updatedAt: string;
}

// Get all orders (admin)
export const getAllOrders = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
}) => {
  const { data } = await axiosInstance.get("/delivery/order", { params });
  return data;
};

// Get order by ID
export const getOrder = async (id: string) => {
  const { data } = await axiosInstance.get<Order>(`/delivery/order/${id}`);
  return data;
};

// Assign driver to order
export const assignDriver = async (orderId: string, driverId: string) => {
  const { data } = await axiosInstance.post(`/delivery/order/${orderId}/assign-driver`, {
    driverId,
  });
  return data;
};

// Update order status (admin)
export const adminChangeStatus = async (orderId: string, status: string, reason?: string) => {
  const { data } = await axiosInstance.patch(`/delivery/order/${orderId}/admin-status`, {
    status,
    reason,
  });
  return data;
};

// Export orders
export const exportOrders = async (params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  const { data } = await axiosInstance.get("/delivery/order/export", {
    params,
    responseType: 'blob',
  });
  return data;
};

// Add note to order
export const addNote = async (orderId: string, note: string) => {
  const { data } = await axiosInstance.post(`/delivery/order/${orderId}/notes`, {
    note,
  });
  return data;
};

// Get order notes
export const getNotes = async (orderId: string) => {
  const { data } = await axiosInstance.get(`/delivery/order/${orderId}/notes`);
  return data;
};

