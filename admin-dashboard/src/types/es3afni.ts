// أنواع بيانات قسم إسعفني
export type Es3afniUrgency = 'low' | 'normal' | 'urgent' | 'critical';
export const URGENCY_LABELS: Record<Es3afniUrgency, string> = {
  low: 'منخفض',
  normal: 'عادي',
  urgent: 'عاجل',
  critical: 'حرج',
};

export interface Es3afniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  urgency?: Es3afniUrgency | string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata: Record<string, any>;
  status: Es3afniStatus;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum Es3afniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// ترجمة حالات إسعفني للعربية
export const Es3afniStatusLabels: Record<Es3afniStatus, string> = {
  [Es3afniStatus.DRAFT]: 'مسودة',
  [Es3afniStatus.PENDING]: 'في الانتظار',
  [Es3afniStatus.CONFIRMED]: 'مؤكد',
  [Es3afniStatus.COMPLETED]: 'مكتمل',
  [Es3afniStatus.CANCELLED]: 'ملغي',
  [Es3afniStatus.EXPIRED]: 'منتهي',
};

// ألوان حالات إسعفني
export const Es3afniStatusColors: Record<Es3afniStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [Es3afniStatus.DRAFT]: 'default',
  [Es3afniStatus.PENDING]: 'warning',
  [Es3afniStatus.CONFIRMED]: 'info',
  [Es3afniStatus.COMPLETED]: 'success',
  [Es3afniStatus.CANCELLED]: 'error',
  [Es3afniStatus.EXPIRED]: 'default',
};

export interface Es3afniFilters {
  status?: Es3afniStatus;
  search?: string;
  bloodType?: string;
  urgency?: Es3afniUrgency | string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Es3afniDonorItem {
  _id: string;
  userId: string;
  bloodType: string;
  available: boolean;
  lastDonation?: string;
  city?: string;
  governorate?: string;
  createdAt?: string;
}
