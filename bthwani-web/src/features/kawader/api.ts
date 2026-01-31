// مطابق لـ app-user
import axiosInstance from "../../api/axios-instance";
import type {
  KawaderItem,
  CreateKawaderPayload,
  UpdateKawaderPayload,
  KawaderListResponse,
} from "./types";

export async function createKawader(
  payload: CreateKawaderPayload
): Promise<KawaderItem> {
  const response = await axiosInstance.post("/kawader", payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function getKawaderList(params?: {
  cursor?: string;
  limit?: number;
}): Promise<KawaderListResponse> {
  const response = await axiosInstance.get("/kawader", { params });
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

export async function getKawader(id: string): Promise<KawaderItem> {
  const response = await axiosInstance.get(`/kawader/${id}`);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function updateKawader(
  id: string,
  payload: UpdateKawaderPayload
): Promise<KawaderItem> {
  const response = await axiosInstance.patch(`/kawader/${id}`, payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function deleteKawader(id: string): Promise<void> {
  await axiosInstance.delete(`/kawader/${id}`);
}
