import axiosInstance from "../utils/api/axiosInstance";
import { refreshIdToken } from "./authService";

/**
 * Helper لجلب headers المصادقة
 */
const getAuthHeaders = async () => {
  try {
    const token = await refreshIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn("⚠️ فشل في جلب التوكن:", error);
    return {};
  }
};

/** استخراج data من استجابة الباكند الموحدة { success, data, meta } (مثل كنز) */
const unwrap = <T>(res: { data?: T } & Record<string, unknown>): T =>
  (res?.data !== undefined ? res.data : res) as T;

// ==================== Types ====================

export type KawaderStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type KawaderOfferType = 'job' | 'service';
export type KawaderJobType = 'full_time' | 'part_time' | 'remote';
export type KawaderApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface KawaderMetadata {
  experience?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  contact?: string;
  [key: string]: any;
}

export interface CreateKawaderPayload {
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  offerType?: KawaderOfferType;
  jobType?: KawaderJobType;
  location?: string;
  salary?: number;
  metadata?: KawaderMetadata;
  status?: KawaderStatus;
}

export interface UpdateKawaderPayload {
  title?: string;
  description?: string;
  scope?: string;
  budget?: number;
  offerType?: KawaderOfferType;
  jobType?: KawaderJobType;
  location?: string;
  salary?: number;
  metadata?: KawaderMetadata;
  status?: KawaderStatus;
}

export interface KawaderItem {
  _id: string;
  ownerId: string | { _id: string; name?: string; email?: string; phone?: string };
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  offerType?: KawaderOfferType;
  jobType?: KawaderJobType;
  location?: string;
  salary?: number;
  metadata?: KawaderMetadata;
  status: KawaderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface KawaderApplicationItem {
  _id: string;
  kawaderId: string | KawaderItem;
  userId: string | { _id: string; name?: string; email?: string; phone?: string };
  coverNote?: string;
  status: KawaderApplicationStatus;
  createdAt?: string;
}

export interface KawaderPortfolioItem {
  _id: string;
  userId: string;
  /** عند الإرجاع من API قد تكون معرفات أو كائنات مُعبأة (url) */
  mediaIds: (string | { _id: string; url?: string })[];
  caption?: string;
  createdAt?: string;
}

export interface KawaderReviewItem {
  _id: string;
  kawaderId: string | { title: string };
  reviewerId: string | { _id: string; name?: string };
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface KawaderListResponse {
  data: KawaderItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== API Functions ====================

/**
 * إنشاء كادر وظيفي جديد
 */
export const createKawader = async (
  payload: CreateKawaderPayload
): Promise<KawaderItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/kawader", payload, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * جلب قائمة الكوادر (مع فلترة اختيارية)
 */
export const getKawaderList = async (
  cursor?: string,
  filters?: { offerType?: KawaderOfferType; jobType?: KawaderJobType; location?: string }
): Promise<KawaderListResponse> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  if (filters?.offerType) params.offerType = filters.offerType;
  if (filters?.jobType) params.jobType = filters.jobType;
  if (filters?.location) params.location = filters.location;
  const response = await axiosInstance.get("/kawader", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: KawaderItem[]; data?: KawaderItem[]; nextCursor?: string; hasMore?: boolean };
  const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  const nextCursor = raw?.nextCursor ?? undefined;
  const hasMore = typeof raw?.hasMore === "boolean" ? raw.hasMore : !!nextCursor;
  return { data: list, nextCursor, hasMore };
};

/**
 * جلب تفاصيل كادر محدد
 */
export const getKawaderDetails = async (id: string): Promise<KawaderItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/kawader/${id}`, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * تحديث كادر
 */
export const updateKawader = async (
  id: string,
  payload: UpdateKawaderPayload
): Promise<KawaderItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/kawader/${id}`, payload, {
    headers,
  });
  return unwrap(response.data);
};

/**
 * حذف كادر
 */
export const deleteKawader = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/kawader/${id}`, {
    headers,
  });
};

/**
 * جلب كوادري الخاصة
 */
export const getMyKawader = async (
  cursor?: string
): Promise<KawaderListResponse> => {
  const headers = await getAuthHeaders();
  const params = cursor ? { cursor } : {};
  const response = await axiosInstance.get("/kawader/my", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: KawaderItem[]; data?: KawaderItem[]; nextCursor?: string; hasMore?: boolean };
  const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  const nextCursor = raw?.nextCursor ?? undefined;
  const hasMore = typeof raw?.hasMore === "boolean" ? raw.hasMore : !!nextCursor;
  return { data: list, nextCursor, hasMore };
};

export interface SearchKawaderParams {
  q?: string;
  status?: KawaderStatus;
  offerType?: KawaderOfferType;
  jobType?: KawaderJobType;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  cursor?: string;
  limit?: number;
}

/**
 * البحث في الكوادر
 */
export const searchKawader = async (
  paramsOrQuery: SearchKawaderParams | string,
  cursorOrStatus?: string
): Promise<KawaderListResponse> => {
  const headers = await getAuthHeaders();
  let params: Record<string, string | number | undefined>;
  if (typeof paramsOrQuery === "string") {
    params = { q: paramsOrQuery };
    if (cursorOrStatus) params.cursor = cursorOrStatus;
  } else {
    params = { ...paramsOrQuery };
    if (cursorOrStatus && !params.cursor) params.cursor = cursorOrStatus;
  }
  const response = await axiosInstance.get("/kawader/search", {
    headers,
    params,
  });
  const raw = unwrap(response.data) as { items?: KawaderItem[]; data?: KawaderItem[]; nextCursor?: string; hasMore?: boolean };
  const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
  const nextCursor = raw?.nextCursor ?? undefined;
  const hasMore = typeof raw?.hasMore === "boolean" ? raw.hasMore : !!nextCursor;
  return { data: list, nextCursor, hasMore };
};

// ---------- التقديم (Applications) ----------

export const applyToKawader = async (
  kawaderId: string,
  coverNote?: string
): Promise<KawaderApplicationItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/kawader/${kawaderId}/apply`, { coverNote }, { headers });
  return unwrap(response.data);
};

export interface MyApplicationsResponse {
  items: KawaderApplicationItem[];
  nextCursor?: string | null;
}

export const getMyApplications = async (cursor?: string, limit?: number): Promise<MyApplicationsResponse> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string | number> = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;
  const response = await axiosInstance.get("/kawader/applications/my", { headers, params });
  const raw = unwrap(response.data) as { items: KawaderApplicationItem[]; nextCursor?: string | null };
  return { items: raw.items ?? [], nextCursor: raw.nextCursor ?? null };
};

export const getKawaderApplications = async (kawaderId: string): Promise<{ items: KawaderApplicationItem[] }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/kawader/${kawaderId}/applications`, { headers });
  const raw = unwrap(response.data) as { items: KawaderApplicationItem[] };
  return { items: raw.items ?? [] };
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'accepted' | 'rejected'
): Promise<KawaderApplicationItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/kawader/applications/${applicationId}/status`, { status }, { headers });
  return unwrap(response.data);
};

// ---------- معرض الأعمال (Portfolio) ----------

export const getMyPortfolio = async (): Promise<{ items: KawaderPortfolioItem[] }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get("/kawader/portfolio/me", { headers });
  const raw = unwrap(response.data) as { items: KawaderPortfolioItem[] };
  return { items: raw.items ?? [] };
};

export const getPortfolioByUser = async (userId: string): Promise<{ items: KawaderPortfolioItem[] }> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/kawader/portfolio/user/${userId}`, { headers });
  const raw = unwrap(response.data) as { items: KawaderPortfolioItem[] };
  return { items: raw.items ?? [] };
};

export const uploadKawaderPortfolioImage = async (imageUri: string): Promise<string> => {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: `kawader-${Date.now()}.jpg`,
  } as any);
  const response = await axiosInstance.post("/kawader/portfolio/upload", formData, {
    headers: { ...headers } as any,
  });
  const result = unwrap(response.data) as { id?: string };
  return result?.id ?? "";
};

export const addPortfolioItem = async (
  mediaIds: string[],
  caption?: string
): Promise<KawaderPortfolioItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post("/kawader/portfolio", { mediaIds: mediaIds ?? [], caption }, { headers });
  return unwrap(response.data);
};

export const removePortfolioItem = async (itemId: string): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(`/kawader/portfolio/${itemId}`, { headers });
};

// ---------- التقييمات (Reviews) ----------

export const createKawaderReview = async (
  kawaderId: string,
  rating: number,
  comment?: string
): Promise<KawaderReviewItem> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/kawader/${kawaderId}/review`, { rating, comment }, { headers });
  return unwrap(response.data);
};

export interface ReviewsByUserResponse {
  items: KawaderReviewItem[];
  nextCursor?: string | null;
  averageRating: number;
  reviewCount: number;
}

export const getReviewsByUser = async (
  userId: string,
  cursor?: string,
  limit?: number
): Promise<ReviewsByUserResponse> => {
  const headers = await getAuthHeaders();
  const params: Record<string, string | number> = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;
  const response = await axiosInstance.get(`/kawader/reviews/user/${userId}`, { headers, params });
  return unwrap(response.data) as ReviewsByUserResponse;
};
