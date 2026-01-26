import axiosInstance from "./axiosInstance";

export interface VendorOrder {
  _id: string;
  user: { fullName: string; phone: string };
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
  };
  paymentMethod: string;
  createdAt: string;
}

// Get vendor orders
export const getVendorOrders = async (cursor?: string, limit = 20) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  
  const { data } = await axiosInstance.get<{
    data: VendorOrder[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
      limit: number;
    };
  }>("/delivery/order/vendor/orders", { params });
  
  return data;
};

// Accept order
export const acceptOrder = async (orderId: string) => {
  const { data } = await axiosInstance.post(
    `/delivery/order/${orderId}/vendor-accept`
  );
  return data;
};

// Cancel order
export const cancelOrder = async (orderId: string, reason: string) => {
  const { data } = await axiosInstance.post(
    `/delivery/order/${orderId}/vendor-cancel`,
    { reason }
  );
  return data;
};

// Get order details
export const getOrderDetails = async (orderId: string) => {
  const { data } = await axiosInstance.get<VendorOrder>(
    `/delivery/order/${orderId}`
  );
  return data;
};

