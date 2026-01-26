import axiosInstance from "../utils/axios";

export interface Promotion {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType: "percentage" | "fixed";
  product?: string | { _id: string; name: string };
  store?: string | { _id: string; name: string };
  category?: string | { _id: string; name: string };
  placements?: string[];
  channels?: string[];
  cities?: string[];
  stacking?: string;
  minQty?: number;
  minOrderSubtotal?: number;
  maxDiscountAmount?: number;
  order?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromotionDto {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType: "percentage" | "fixed";
  product?: string;
  store?: string;
  category?: string;
  placements?: string[];
  channels?: string[];
  cities?: string[];
  stacking?: string;
  minQty?: number;
  minOrderSubtotal?: number;
  maxDiscountAmount?: number;
  order?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

// Get all promotions (admin)
export const getAllPromotions = async (isActive?: boolean) => {
  const params = isActive !== undefined ? { isActive } : {};
  const { data } = await axiosInstance.get<Promotion[]>("/promotions", { params });
  return data;
};

// Get promotion by ID
export const getPromotion = async (id: string) => {
  const { data } = await axiosInstance.get<Promotion>(`/promotions/${id}`);
  return data;
};

// Get promotions by placement (public)
export const getPromotionsByPlacement = async (placement?: string, channel?: string) => {
  const params: any = {};
  if (placement) params.placement = placement;
  if (channel) params.channel = channel;
  
  const { data } = await axiosInstance.get<Promotion[]>("/promotions/by-placement", { params });
  return data;
};

// Create promotion
export const createPromotion = async (promotionData: CreatePromotionDto) => {
  const { data } = await axiosInstance.post<Promotion>("/promotions", promotionData);
  return data;
};

// Update promotion
export const updatePromotion = async (id: string, promotionData: Partial<CreatePromotionDto>) => {
  const { data } = await axiosInstance.patch<Promotion>(`/promotions/${id}`, promotionData);
  return data;
};

// Delete promotion
export const deletePromotion = async (id: string) => {
  const { data } = await axiosInstance.delete(`/promotions/${id}`);
  return data;
};

// Record click
export const recordClick = async (id: string) => {
  const { data } = await axiosInstance.post(`/promotions/${id}/click`);
  return data;
};

// Record conversion
export const recordConversion = async (id: string) => {
  const { data } = await axiosInstance.post(`/promotions/${id}/conversion`);
  return data;
};

// Get statistics (admin)
export const getStatistics = async () => {
  const { data } = await axiosInstance.get("/promotions/stats/overview");
  return data;
};

