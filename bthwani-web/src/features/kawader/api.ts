// مطابق لـ app-user
import axiosInstance from "../../api/axios-instance";
import type {
  KawaderItem,
  CreateKawaderPayload,
  UpdateKawaderPayload,
  KawaderListResponse,
  KawaderApplicationItem,
  KawaderPortfolioItem,
  KawaderReviewItem,
  ReviewsByUserResponse,
} from "./types";

/** شكل استجابة القائمة من الـ API (قبل التحويل إلى KawaderListResponse) */
interface KawaderListRaw {
  items?: KawaderItem[];
  data?: KawaderItem[];
  nextCursor?: string;
  hasMore?: boolean;
}

const unwrap = <T>(raw: { data?: T } & Record<string, unknown>): T =>
  (raw?.data !== undefined ? raw.data : raw) as T;

export async function createKawader(
  payload: CreateKawaderPayload
): Promise<KawaderItem> {
  const response = await axiosInstance.post("/kawader", payload);
  return unwrap(response.data);
}

export async function getKawaderList(params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  offerType?: string;
  jobType?: string;
  location?: string;
}): Promise<KawaderListResponse> {
  const response = await axiosInstance.get("/kawader", { params });
  const raw = response.data;
  const data = unwrap(raw) as KawaderListRaw;
  const list = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return {
    items: list,
    data: list,
    nextCursor: data?.nextCursor ?? (raw as KawaderListRaw)?.nextCursor,
    hasMore: data?.hasMore ?? (raw as KawaderListRaw)?.hasMore ?? !!data?.nextCursor,
  };
}

/** عروضي — للمستخدم المصادق */
export async function getMyKawader(params?: {
  cursor?: string;
  limit?: number;
}): Promise<KawaderListResponse> {
  const response = await axiosInstance.get("/kawader/my", { params });
  const raw = response.data;
  const data = unwrap(raw) as KawaderListRaw;
  const list = Array.isArray(data?.items) ? data.items : [];
  return {
    items: list,
    data: list,
    nextCursor: data?.nextCursor,
    hasMore: !!data?.nextCursor,
  };
}

/** بحث — q وفلترة */
export async function searchKawader(params: {
  q?: string;
  cursor?: string;
  limit?: number;
  status?: string;
  offerType?: string;
  jobType?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
}): Promise<KawaderListResponse> {
  const response = await axiosInstance.get("/kawader/search", { params });
  const raw = response.data;
  const data = unwrap(raw) as KawaderListRaw;
  const list = Array.isArray(data?.items) ? data.items : [];
  return {
    items: list,
    data: list,
    nextCursor: data?.nextCursor,
    hasMore: !!data?.nextCursor,
  };
}

export async function getKawader(id: string): Promise<KawaderItem> {
  const response = await axiosInstance.get(`/kawader/${id}`);
  return unwrap(response.data);
}

export async function updateKawader(
  id: string,
  payload: UpdateKawaderPayload
): Promise<KawaderItem> {
  const response = await axiosInstance.patch(`/kawader/${id}`, payload);
  return unwrap(response.data);
}

export async function deleteKawader(id: string): Promise<void> {
  await axiosInstance.delete(`/kawader/${id}`);
}

// ---------- التقديم (Apply) ----------
export async function applyToKawader(
  kawaderId: string,
  coverNote?: string
): Promise<KawaderApplicationItem> {
  const response = await axiosInstance.post(`/kawader/${kawaderId}/apply`, {
    coverNote: coverNote || undefined,
  });
  return unwrap(response.data);
}

export async function getKawaderApplications(
  kawaderId: string
): Promise<{ items: KawaderApplicationItem[] }> {
  const response = await axiosInstance.get(`/kawader/${kawaderId}/applications`);
  const data = unwrap(response.data) as { items?: KawaderApplicationItem[] };
  return { items: data?.items ?? [] };
}

export async function getMyApplications(
  cursor?: string,
  limit?: number
): Promise<{ items: KawaderApplicationItem[]; nextCursor?: string }> {
  const params: Record<string, string | number> = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;
  const response = await axiosInstance.get("/kawader/applications/my", {
    params,
  });
  const data = unwrap(response.data) as {
    items?: KawaderApplicationItem[];
    nextCursor?: string;
  };
  return {
    items: data?.items ?? [],
    nextCursor: data?.nextCursor,
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected"
): Promise<KawaderApplicationItem> {
  const response = await axiosInstance.patch(
    `/kawader/applications/${applicationId}/status`,
    { status }
  );
  return unwrap(response.data);
}

// ---------- معرض الأعمال (Portfolio) ----------
export async function getPortfolioByUser(
  userId: string
): Promise<{ items: KawaderPortfolioItem[] }> {
  const response = await axiosInstance.get(
    `/kawader/portfolio/user/${userId}`
  );
  const data = unwrap(response.data) as { items?: KawaderPortfolioItem[] };
  return { items: data?.items ?? [] };
}

// ---------- التقييمات (Reviews) ----------
export async function getReviewsByUser(
  userId: string,
  cursor?: string,
  limit?: number
): Promise<ReviewsByUserResponse> {
  const params: Record<string, string | number> = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;
  const response = await axiosInstance.get(
    `/kawader/reviews/user/${userId}`,
    { params }
  );
  return unwrap(response.data) as ReviewsByUserResponse;
}

export async function createKawaderReview(
  kawaderId: string,
  rating: number,
  comment?: string
): Promise<KawaderReviewItem> {
  const response = await axiosInstance.post(`/kawader/${kawaderId}/review`, {
    rating,
    comment: comment || undefined,
  });
  return unwrap(response.data);
}
