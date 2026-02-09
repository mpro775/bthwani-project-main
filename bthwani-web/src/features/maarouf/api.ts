// مطابق لـ app-user
import axiosInstance from "../../api/axios-instance";
import type {
  MaaroufItem,
  CreateMaaroufPayload,
  UpdateMaaroufPayload,
  MaaroufListResponse,
  MaaroufCategory,
} from "./types";

export async function uploadMaaroufImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/maarouf/upload", formData);
  const raw = response.data;
  const data = raw?.data ?? raw;
  return data?.url ?? "";
}

export async function createMaarouf(
  payload: CreateMaaroufPayload
): Promise<MaaroufItem> {
  const response = await axiosInstance.post("/maarouf", payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function getMaaroufList(params?: {
  cursor?: string;
  limit?: number;
  category?: MaaroufCategory;
  hasReward?: boolean;
}): Promise<MaaroufListResponse> {
  const response = await axiosInstance.get("/maarouf", { params });
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

export async function getMaarouf(id: string): Promise<MaaroufItem> {
  const response = await axiosInstance.get(`/maarouf/${id}`);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function updateMaarouf(
  id: string,
  payload: UpdateMaaroufPayload
): Promise<MaaroufItem> {
  const response = await axiosInstance.patch(`/maarouf/${id}`, payload);
  const raw = response.data;
  return raw?.data ?? raw;
}

export async function deleteMaarouf(id: string): Promise<void> {
  await axiosInstance.delete(`/maarouf/${id}`);
}
