// مطابق لـ app-user
import axiosInstance from "../../api/axios-instance";
import type {
  Es3afniItem,
  CreateEs3afniPayload,
  UpdateEs3afniPayload,
  Es3afniListResponse,
  Es3afniDonorProfile,
  RegisterDonorPayload,
} from "./types";

export async function createEs3afni(
  payload: CreateEs3afniPayload
): Promise<Es3afniItem> {
  const response = await axiosInstance.post("/es3afni", payload);
  const data = response.data;
  return data?.data ?? data;
}

export async function getEs3afniList(params?: {
  cursor?: string;
  limit?: number;
  bloodType?: string;
  status?: string;
  urgency?: string;
}): Promise<Es3afniListResponse> {
  const response = await axiosInstance.get("/es3afni", { params });
  const data = response.data;
  const payload = data?.data ?? data;
  return {
    items: payload?.items ?? [],
    nextCursor: payload?.nextCursor,
  };
}

export async function getMyEs3afni(cursor?: string): Promise<Es3afniListResponse> {
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/es3afni/my", { params });
  const data = response.data;
  const payload = data?.data ?? data;
  return {
    items: payload?.items ?? [],
    nextCursor: payload?.nextCursor,
  };
}

export async function getEs3afni(id: string): Promise<Es3afniItem> {
  const response = await axiosInstance.get(`/es3afni/${id}`);
  const data = response.data;
  return data?.data ?? data;
}

export async function updateEs3afni(
  id: string,
  payload: UpdateEs3afniPayload
): Promise<Es3afniItem> {
  const response = await axiosInstance.patch(`/es3afni/${id}`, payload);
  const data = response.data;
  return data?.data ?? data;
}

export async function deleteEs3afni(id: string): Promise<void> {
  await axiosInstance.delete(`/es3afni/${id}`);
}

// المتبرعون
export async function getDonorProfile(): Promise<Es3afniDonorProfile> {
  const response = await axiosInstance.get("/es3afni/donors/me");
  const data = response.data;
  return data?.data ?? data;
}

export async function registerDonor(
  payload: RegisterDonorPayload
): Promise<Es3afniDonorProfile> {
  const response = await axiosInstance.post("/es3afni/donors/me", payload);
  const data = response.data;
  return data?.data ?? data;
}

export async function updateDonor(
  payload: Partial<RegisterDonorPayload>
): Promise<Es3afniDonorProfile> {
  const response = await axiosInstance.patch("/es3afni/donors/me", payload);
  const data = response.data;
  return data?.data ?? data;
}
