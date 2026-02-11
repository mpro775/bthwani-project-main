/**
 * Kenz API - rider-app (light_driver)
 * مهام توصيل كنز
 */

import axios from "./axios";

export interface KenzDeliveryTask {
  _id: string;
  title: string;
  price?: number;
  city?: string;
  deliveryOption?: string;
  deliveryFee?: number;
  ownerId?: { fullName?: string; phone?: string };
  createdAt?: string;
}

export const getKenzDeliveryTasks = async (): Promise<KenzDeliveryTask[]> => {
  const response = await axios.get("/kenz/deliveries/list");
  const data = response.data;
  return Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
};

export const assignKenzDelivery = async (
  kenzId: string,
  deliveryId: string
): Promise<unknown> => {
  const response = await axios.post(`/kenz/${kenzId}/assign-delivery`, {
    deliveryId,
  });
  return response.data;
};
