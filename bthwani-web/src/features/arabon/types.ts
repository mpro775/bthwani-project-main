// src/features/arabon/types.ts
export type ArabonStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ArabonBookingPeriod = 'hour' | 'day' | 'week';

export interface ArabonSocialLinks {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
}

export interface ArabonItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: Record<string, any>;
  status: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateArabonPayload {
  ownerId?: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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
  dateFrom?: string;
  dateTo?: string;
}

export interface ArabonListResponse {
  items: ArabonItem[];
  nextCursor?: string;
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
