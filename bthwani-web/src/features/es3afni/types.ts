// مطابق لـ app-user - اسعفني (شبكة تبرع بالدم عاجلة)
export type Es3afniStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired";

export type Es3afniUrgency = "low" | "normal" | "urgent" | "critical";
export const URGENCY_LEVELS: Es3afniUrgency[] = ["low", "normal", "urgent", "critical"];
export const URGENCY_LABELS: Record<Es3afniUrgency, string> = {
  low: "منخفض",
  normal: "عادي",
  urgent: "عاجل",
  critical: "حرج",
};

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Es3afniLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Es3afniMetadata {
  contact?: string;
  unitsNeeded?: number;
  urgency?: string;
  [key: string]: any;
}

export interface Es3afniItem {
  _id: string;
  ownerId: string | { _id: string };
  title: string;
  description?: string;
  bloodType?: string;
  urgency?: Es3afniUrgency | string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status: Es3afniStatus;
  publishedAt?: Date | string;
  expiresAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  owner?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateEs3afniPayload {
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  urgency?: Es3afniUrgency | string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status?: Es3afniStatus;
}

export interface UpdateEs3afniPayload {
  title?: string;
  description?: string;
  bloodType?: string;
  urgency?: Es3afniUrgency | string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status?: Es3afniStatus;
}

export interface Es3afniFilters {
  status?: Es3afniStatus;
  bloodType?: BloodType;
  urgency?: Es3afniUrgency | string;
  search?: string;
}

export interface Es3afniListResponse {
  items: Es3afniItem[];
  nextCursor?: string;
}

// المتبرعون
export interface Es3afniDonorProfile {
  _id: string;
  userId: string;
  bloodType: string;
  lastDonation?: string;
  available: boolean;
  city?: string;
  governorate?: string;
  location?: Es3afniLocation;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterDonorPayload {
  bloodType: string;
  lastDonation?: string;
  available?: boolean;
  city?: string;
  governorate?: string;
  location?: Es3afniLocation;
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const BloodTypeLabels: Record<BloodType, string> = {
  "A+": "A+", "A-": "A-", "B+": "B+", "B-": "B-",
  "AB+": "AB+", "AB-": "AB-", "O+": "O+", "O-": "O-",
};

export const BloodTypeValues: BloodType[] = [...BLOOD_TYPES];

export const Es3afniStatusValues: Es3afniStatus[] = ["draft", "pending", "confirmed", "completed", "cancelled", "expired"];

export const Es3afniStatusLabels: Record<Es3afniStatus, string> = {
  draft: "مسودة",
  pending: "في الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  expired: "منتهي",
};

export const Es3afniStatusColors: Record<Es3afniStatus, string> = {
  draft: "#9e9e9e",
  pending: "#ff9800",
  confirmed: "#ff500d",
  completed: "#4caf50",
  cancelled: "#f44336",
  expired: "#757575",
};
