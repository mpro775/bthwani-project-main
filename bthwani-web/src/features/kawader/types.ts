// مطابق لـ app-user
export type KawaderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type KawaderOfferType = "job" | "service";
export type KawaderJobType = "full_time" | "part_time" | "remote";
export type KawaderApplicationStatus = "pending" | "accepted" | "rejected";

export interface KawaderMetadata {
  experience?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  contact?: string;
  [key: string]: any;
}

export interface KawaderItem {
  _id: string;
  ownerId: string | { _id: string; name?: string };
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
  createdAt: string | Date;
  updatedAt: string | Date;
  owner?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
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

export interface KawaderFilters {
  status?: KawaderStatus;
  search?: string;
  budgetMin?: number;
  budgetMax?: number;
  offerType?: KawaderOfferType;
  jobType?: KawaderJobType;
  location?: string;
}

export interface KawaderApplicationItem {
  _id: string;
  kawaderId: string | KawaderItem;
  userId: string | { _id: string; name?: string };
  coverNote?: string;
  status: KawaderApplicationStatus;
  createdAt?: string;
}

export interface KawaderPortfolioItem {
  _id: string;
  userId: string;
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

export interface ReviewsByUserResponse {
  items: KawaderReviewItem[];
  nextCursor?: string | null;
  averageRating: number;
  reviewCount: number;
}

export interface KawaderListResponse {
  items: KawaderItem[];
  data?: KawaderItem[];
  nextCursor?: string;
  hasMore?: boolean;
}

export const WORK_SCOPES = [
  "مشروع قصير المدى",
  "مشروع متوسط المدى",
  "مشروع طويل المدى",
  "دوام كامل",
  "دوام جزئي",
  "عقد شهري",
  "عقد سنوي",
  "عمل حر",
] as const;

export const KawaderStatusLabels: Record<KawaderStatus, string> = {
  draft: "مسودة",
  pending: "في الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const KawaderStatusColors: Record<KawaderStatus, string> = {
  draft: "#9e9e9e",
  pending: "#ff9800",
  confirmed: "#ff500d",
  completed: "#4caf50",
  cancelled: "#f44336",
};

export const KawaderStatusValues: KawaderStatus[] = ["draft", "pending", "confirmed", "completed", "cancelled"];
