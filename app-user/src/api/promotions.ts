import axiosInstance from "@/utils/api/axiosInstance";

export interface AppPromotion {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType: "percentage" | "fixed";
  product?: { _id: string; name: string };
  store?: { _id: string; name: string };
  category?: { _id: string; name: string };
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

  const { data } = await axiosInstance.get<AppPromotion[]>(
    "/promotions/by-placement",
    { params }
  );
  return data.data || data;
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

