import axiosInstance from "./axios-instance";

/**
 * Utility Pricing API - للغاز والماء
 * ملاحظة: utility.ts الموجود هو لخدمات errands وليس gas/water
 */

export type UtilityKind = "gas" | "water";
export type WaterSizeKey = "small" | "medium" | "large";

export interface UtilityOptionsResponse {
  city: string;
  gas: {
    cylinderSizeLiters: number;
    pricePerCylinder: number;
    minQty: number;
    deliveryPolicy: "flat" | "strategy";
    flatFee: number | null;
  } | null;
  water: {
    sizes: Array<{
      key: WaterSizeKey;
      capacityLiters: number;
      pricePerTanker: number;
    }>;
    allowHalf: boolean;
    halfPolicy: "linear" | "multiplier" | "fixed";
    deliveryPolicy: "flat" | "strategy";
    flatFee: number | null;
  } | null;
}

export interface CalculatePriceRequest {
  serviceType: "gas" | "water";
  city?: string;
  quantity?: number;
  size?: WaterSizeKey;
  half?: boolean;
  customerLocation?: { lat: number; lng: number };
}

export interface CalculatePriceResponse {
  productPrice: number;
  deliveryFee: number;
  total: number;
  breakdown: {
    serviceType: UtilityKind;
    city: string;
    quantity?: number;
    size?: string;
    half?: boolean;
  };
}

/**
 * الحصول على خيارات التسعير حسب المدينة
 */
export const getUtilityOptions = async (
  city?: string
): Promise<UtilityOptionsResponse> => {
  const response = await axiosInstance.get<UtilityOptionsResponse>(
    "/utility/options",
    { params: { city } }
  );
  return response.data;
};

/**
 * حساب سعر خدمة الغاز أو الماء
 */
export const calculateUtilityPrice = async (
  data: CalculatePriceRequest
): Promise<CalculatePriceResponse> => {
  const response = await axiosInstance.post<CalculatePriceResponse>(
    "/utility/calculate-price",
    data
  );
  return response.data;
};

export default {
  getUtilityOptions,
  calculateUtilityPrice,
};

