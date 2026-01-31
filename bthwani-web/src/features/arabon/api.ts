// مطابق لـ app-user
import axiosInstance from "../../api/axios-instance";
import type {
  ArabonItem,
  CreateArabonPayload,
  UpdateArabonPayload,
  ArabonListResponse,
  ArabonStats,
  ArabonActivityItem,
} from "./types";

export async function createArabon(
  payload: CreateArabonPayload
): Promise<ArabonItem> {
  const response = await axiosInstance.post("/arabon", payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function getArabonList(params?: {
  cursor?: string;
  status?: string;
  limit?: number;
}): Promise<ArabonListResponse> {
  const response = await axiosInstance.get("/arabon", { params });
  const d = response.data;
  const data = d?.data ?? d?.items ?? [];
  return {
    items: Array.isArray(data) ? data : [],
    data: Array.isArray(data) ? data : [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
}

export async function getMyArabon(params?: {
  cursor?: string;
  status?: string;
  limit?: number;
}): Promise<ArabonListResponse> {
  const response = await axiosInstance.get("/arabon/my", { params });
  const d = response.data;
  const data = d?.data ?? d?.items ?? [];
  return {
    items: Array.isArray(data) ? data : [],
    data: Array.isArray(data) ? data : [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
}

export async function searchArabon(
  query: string,
  status?: string,
  cursor?: string
): Promise<ArabonListResponse> {
  const params: Record<string, string> = { q: query.trim() };
  if (status) params.status = status;
  if (cursor) params.cursor = cursor;
  const response = await axiosInstance.get("/arabon/search", { params });
  const d = response.data;
  const data = d?.data ?? d?.items ?? [];
  return {
    items: Array.isArray(data) ? data : [],
    data: Array.isArray(data) ? data : [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
}

export async function getArabon(id: string): Promise<ArabonItem> {
  const response = await axiosInstance.get(`/arabon/${id}`);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function updateArabon(
  id: string,
  payload: UpdateArabonPayload
): Promise<ArabonItem> {
  const response = await axiosInstance.patch(`/arabon/${id}`, payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function deleteArabon(id: string): Promise<void> {
  await axiosInstance.delete(`/arabon/${id}`);
}

export async function updateArabonStatus(
  id: string,
  status: string
): Promise<ArabonItem> {
  const response = await axiosInstance.patch(`/arabon/${id}/status`, {
    status,
  });
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function getArabonStats(scope?: "my"): Promise<ArabonStats> {
  const params = scope === "my" ? { scope: "my" } : undefined;
  const response = await axiosInstance.get("/arabon/stats", { params });
  const raw = response.data?.data ?? response.data;
  return {
    total: raw?.total ?? 0,
    draft: raw?.draft ?? 0,
    pending: raw?.pending ?? 0,
    confirmed: raw?.confirmed ?? 0,
    completed: raw?.completed ?? 0,
    cancelled: raw?.cancelled ?? 0,
    totalDepositAmount: raw?.totalDepositAmount ?? 0,
  };
}

export async function getArabonActivity(
  id: string,
  cursor?: string
): Promise<{ data: ArabonActivityItem[]; nextCursor?: string; hasMore: boolean }> {
  const params = cursor ? { cursor } : undefined;
  const response = await axiosInstance.get(`/arabon/${id}/activity`, {
    params,
  });
  const d = response.data;
  const data = d?.data ?? d?.items ?? [];
  return {
    data: Array.isArray(data) ? data : [],
    nextCursor: d?.nextCursor,
    hasMore: d?.hasMore ?? !!d?.nextCursor,
  };
}
