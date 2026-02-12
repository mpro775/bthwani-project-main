import axiosInstance from "./axiosInstance";
import { unwrapResponse } from "../utils/apiHelpers";

export interface VendorOrder {
  _id: string;
  user: { fullName: string; phone: string };
  items: {
    product: { name: string };
    quantity: number;
    price: number;
  }[];
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

type VendorOrdersResponse = {
  data: VendorOrder[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};

// Get vendor orders
export const getVendorOrders = async (cursor?: string, limit = 20) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  const res = await axiosInstance.get("/delivery/order/vendor/orders", {
    params,
  });
  return unwrapResponse<VendorOrdersResponse>(res);
};

// Accept order
export const acceptOrder = async (orderId: string) => {
  const res = await axiosInstance.post(
    `/delivery/order/${orderId}/vendor-accept`
  );
  return unwrapResponse<any>(res);
};

// Cancel order
export const cancelOrder = async (orderId: string, reason: string) => {
  const res = await axiosInstance.post(
    `/delivery/order/${orderId}/vendor-cancel`,
    { reason }
  );
  return unwrapResponse<any>(res);
};

// Get order details
export const getOrderDetails = async (orderId: string) => {
  const res = await axiosInstance.get(`/delivery/order/${orderId}`);
  return unwrapResponse<VendorOrder>(res);
};

