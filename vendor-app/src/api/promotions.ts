import axiosInstance from "./axiosInstance";

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

  const { data } = await axiosInstance.get<VendorPromotion[]>(
    "/promotions/by-placement",
    { params }
  );
  return data;
};

// Record click on promotion
export const recordClick = async (promotionId: string) => {
  const { data } = await axiosInstance.post(`/promotions/${promotionId}/click`);
  return data;
};

// Record conversion (order from promotion)
export const recordConversion = async (promotionId: string) => {
  const { data } = await axiosInstance.post(
    `/promotions/${promotionId}/conversion`
  );
  return data;
};

