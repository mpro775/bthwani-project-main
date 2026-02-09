import axios from "./axios";
import type { ApiResponse } from "../types/api";

export interface MaaroufDeliveryItem {
  _id: string;
  title: string;
  description?: string;
  metadata?: {
    pickupAddress?: string;
    dropoffAddress?: string;
  } & Record<string, any>;
  ownerId: string;
  status: "draft" | "pending" | "confirmed" | "completed" | "cancelled";
  reward?: number;
  deliveryToggle?: boolean;
  deliveryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardHold {
  _id: string;
  founderId: string;
  claimerId?: string;
  maaroufId: string;
  amount: number;
  status: "pending" | "released" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export const getMaaroufDeliveryTasks = async (): Promise<MaaroufDeliveryItem[]> => {
  const res = await axios.get<ApiResponse<MaaroufDeliveryItem[]>>("/maarouf/deliveries/list");
  return (res.data.data as any) ?? (res.data as any);
};

export const getMaaroufDetails = async (id: string): Promise<MaaroufDeliveryItem> => {
  const res = await axios.get<ApiResponse<MaaroufDeliveryItem>>(`/maarouf/${id}`);
  return (res.data.data as any) ?? (res.data as any);
};

export const getMaaroufRewardHolds = async (id: string): Promise<RewardHold[]> => {
  const res = await axios.get<ApiResponse<RewardHold[]>>(`/maarouf/${id}/reward-holds`);
  return (res.data.data as any) ?? (res.data as any);
};

export const verifyMaaroufRewardCode = async (
  maaroufId: string,
  holdId: string,
  code: string,
): Promise<RewardHold> => {
  const res = await axios.post<ApiResponse<RewardHold>>(
    `/maarouf/${maaroufId}/reward-hold/${holdId}/verify-code`,
    { code },
  );
  return (res.data.data as any) ?? (res.data as any);
};

