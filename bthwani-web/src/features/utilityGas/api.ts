// src/features/utilityGas/api.ts
import axiosInstance from "../../api/axios-instance";
import type { GasOrderPayload, UserProfile, UtilityOptionsResp } from "./types";

export async function fetchUserProfile(): Promise<UserProfile> {
  const { data } = await axiosInstance.get("/user/profile");
  return data;
}

export async function fetchUtilityOptions(
  city: string
): Promise<UtilityOptionsResp> {
  const { data } = await axiosInstance.get<UtilityOptionsResp>(
    "/utility/options",
    { params: { city } }
  );
  return data;
}

export async function createGasOrder(payload: GasOrderPayload) {
  const { data } = await axiosInstance.post("/utility/order", payload);
  return data as { _id?: string; id?: string };
}
