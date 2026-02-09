// مطابق لـ app-user
export type MaaroufStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type MaaroufKind = "lost" | "found";

export type MaaroufCategory = "phone" | "pet" | "id" | "wallet" | "keys" | "bag" | "other";

export const MAAROUF_CATEGORIES: { value: MaaroufCategory; label: string }[] = [
  { value: "phone", label: "هاتف" },
  { value: "pet", label: "حيوان" },
  { value: "id", label: "هوية" },
  { value: "wallet", label: "محفظة" },
  { value: "keys", label: "مفاتيح" },
  { value: "bag", label: "حقيبة" },
  { value: "other", label: "أخرى" },
];

export interface MaaroufMetadata {
  color?: string;
  location?: string;
  date?: string;
  contact?: string;
  [key: string]: any;
}

export interface MaaroufItem {
  _id: string;
  ownerId: string | { _id: string };
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status: MaaroufStatus;
  mediaUrls?: string[];
  category?: MaaroufCategory;
  reward?: number;
  location?: { type: "Point"; coordinates: [number, number] };
  deliveryToggle?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  owner?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateMaaroufPayload {
  ownerId: string;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status?: MaaroufStatus;
  mediaUrls?: string[];
  category?: MaaroufCategory;
  reward?: number;
  location?: { type: "Point"; coordinates: [number, number] };
  deliveryToggle?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string;
}

export interface UpdateMaaroufPayload {
  title?: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status?: MaaroufStatus;
  mediaUrls?: string[];
  category?: MaaroufCategory;
  reward?: number;
  location?: { type: "Point"; coordinates: [number, number] };
  deliveryToggle?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string;
}

export interface MaaroufFilters {
  status?: MaaroufStatus;
  kind?: MaaroufKind;
  category?: MaaroufCategory;
  hasReward?: boolean;
  search?: string;
  tags?: string[];
}

export interface MaaroufListResponse {
  items: MaaroufItem[];
  data?: MaaroufItem[];
  nextCursor?: string;
  hasMore?: boolean;
}

export const MaaroufKindLabels: Record<MaaroufKind, string> = {
  lost: "مفقود",
  found: "موجود",
};

export const MaaroufStatusLabels: Record<MaaroufStatus, string> = {
  draft: "مسودة",
  pending: "في الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const MaaroufStatusColors: Record<MaaroufStatus, string> = {
  draft: "#9e9e9e",
  pending: "#ff9800",
  confirmed: "#ff500d",
  completed: "#4caf50",
  cancelled: "#f44336",
};

export const MaaroufKindValues: MaaroufKind[] = ["lost", "found"];
export const MaaroufStatusValues: MaaroufStatus[] = ["draft", "pending", "confirmed", "completed", "cancelled"];
