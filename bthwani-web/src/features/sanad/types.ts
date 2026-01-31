// مطابق لـ app-user
export type SanadStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type SanadKind = "specialist" | "emergency" | "charity";

export interface SanadMetadata {
  location?: string;
  contact?: string;
  [key: string]: any;
}

export interface SanadItem {
  _id: string;
  ownerId: string | { _id: string };
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status: SanadStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  owner?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateSanadPayload {
  ownerId: string;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status?: SanadStatus;
}

export interface UpdateSanadPayload {
  title?: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status?: SanadStatus;
}

export interface SanadListResponse {
  items: SanadItem[];
  data?: SanadItem[];
  nextCursor?: string;
  hasMore?: boolean;
}

export const SanadKindLabels: Record<SanadKind, string> = {
  specialist: "خدمة متخصصة",
  emergency: "فزعة",
  charity: "خيري",
};

export const SanadStatusLabels: Record<SanadStatus, string> = {
  draft: "مسودة",
  pending: "في الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const SanadStatusColors: Record<SanadStatus, string> = {
  draft: "#9e9e9e",
  pending: "#ff9800",
  confirmed: "#ff500d",
  completed: "#4caf50",
  cancelled: "#f44336",
};

export const SanadKindColors: Record<SanadKind, string> = {
  specialist: "#3f51b5",
  emergency: "#f44336",
  charity: "#4caf50",
};
