import axiosInstance from "./axiosInstance";
import { unwrapResponse } from "../utils/apiHelpers";

export interface DeliveryStore {
  _id: string;
  name?: string;
  name_ar?: string;
  name_en?: string;
  address?: string;
  category?: { _id: string; name: string };
  location?: { lat: number; lng: number };
  isActive?: boolean;
  image?: string;
  logo?: string;
  forceClosed?: boolean;
  forceOpen?: boolean;
  schedule?: { day: string; open: boolean; from?: string; to?: string }[];
  commissionRate?: number;
  takeCommission?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  pricingStrategy?: string | null;
  pricingStrategyType?: string;
  [key: string]: any;
}

export const getStore = async (storeId: string) => {
  const res = await axiosInstance.get(`/delivery/stores/${storeId}`);
  return unwrapResponse<DeliveryStore>(res);
};

export const updateStore = async (storeId: string, body: Partial<DeliveryStore>) => {
  const res = await axiosInstance.put(`/delivery/stores/${storeId}`, body);
  return unwrapResponse<DeliveryStore>(res);
};
