// مطابق لـ app-user
import axiosInstance from "../../api/axios-instance";
import type {
  SanadItem,
  CreateSanadPayload,
  UpdateSanadPayload,
  SanadListResponse,
} from "./types";

export async function createSanad(
  payload: CreateSanadPayload
): Promise<SanadItem> {
  const response = await axiosInstance.post("/sanad", payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function getSanadList(params?: {
  cursor?: string;
  limit?: number;
}): Promise<SanadListResponse> {
  const response = await axiosInstance.get("/sanad", { params });
  const raw = response.data;
  const data = raw?.data ?? raw;
  const list = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
  return {
    items: list,
    data: list,
    nextCursor: data?.nextCursor ?? raw?.nextCursor,
    hasMore: data?.hasMore ?? raw?.hasMore ?? !!data?.nextCursor,
  };
}

export async function getSanad(id: string): Promise<SanadItem> {
  const response = await axiosInstance.get(`/sanad/${id}`);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function updateSanad(
  id: string,
  payload: UpdateSanadPayload
): Promise<SanadItem> {
  const response = await axiosInstance.patch(`/sanad/${id}`, payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function deleteSanad(id: string): Promise<void> {
  await axiosInstance.delete(`/sanad/${id}`);
}
