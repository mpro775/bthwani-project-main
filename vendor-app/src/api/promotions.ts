import axiosInstance from "./axiosInstance";
import { unwrapResponse } from "../utils/apiHelpers";

export interface VendorPromotion {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType: "percentage" | "fixed";
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// Get promotions by placement
export const getPromotionsByPlacement = async (
  placement?: string,
  channel = "app"
) => {
  const params: any = { channel };
  if (placement) params.placement = placement;
  const res = await axiosInstance.get("/promotions/by-placement", { params });
  const data = unwrapResponse<VendorPromotion[]>(res);
  return Array.isArray(data) ? data : [];
};

// Record click on promotion
export const recordClick = async (promotionId: string) => {
  const res = await axiosInstance.post(`/promotions/${promotionId}/click`);
  return unwrapResponse<any>(res);
};

// Record conversion (order from promotion)
export const recordConversion = async (promotionId: string) => {
  const res = await axiosInstance.post(
    `/promotions/${promotionId}/conversion`
  );
  return unwrapResponse<any>(res);
};

