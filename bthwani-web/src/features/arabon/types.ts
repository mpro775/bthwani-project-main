// مطابق لـ app-user
export type ArabonStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ArabonBookingPeriod = "hour" | "day" | "week";

export interface ArabonMetadata {
  guests?: number;
  notes?: string;
  [key: string]: any;
}

export interface ArabonSocialLinks {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
}

export interface ArabonItem {
  _id: string;
  ownerId: string | { _id: string };
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  owner?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateArabonPayload {
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status?: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
}

export interface UpdateArabonPayload {
  title?: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status?: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
}

export interface ArabonFilters {
  status?: ArabonStatus;
  search?: string;
}

export interface ArabonListResponse {
  items: ArabonItem[];
  data?: ArabonItem[];
  nextCursor?: string;
  hasMore?: boolean;
}

export interface ArabonStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalDepositAmount: number;
}

export interface ArabonActivityItem {
  _id: string;
  arabonId: string;
  oldStatus?: string;
  newStatus: string;
  userId?: string;
  createdAt: string;
}

// ترجمة حالات العربون للعربية
export const ArabonStatusLabels: Record<ArabonStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ألوان حالات العربون
export const ArabonStatusColors: Record<ArabonStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

// Array of all ArabonStatus values for iteration
export const ArabonStatusValues: ArabonStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];
