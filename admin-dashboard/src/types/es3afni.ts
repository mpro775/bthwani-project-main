// أنواع بيانات قسم إسعفني
export interface Es3afniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata: Record<string, any>;
  status: Es3afniStatus;
  createdAt: string;
  updatedAt: string;
}

export enum Es3afniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة حالات إسعفني للعربية
export const Es3afniStatusLabels: Record<Es3afniStatus, string> = {
  [Es3afniStatus.DRAFT]: 'مسودة',
  [Es3afniStatus.PENDING]: 'في الانتظار',
  [Es3afniStatus.CONFIRMED]: 'مؤكد',
  [Es3afniStatus.COMPLETED]: 'مكتمل',
  [Es3afniStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات إسعفني
export const Es3afniStatusColors: Record<Es3afniStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [Es3afniStatus.DRAFT]: 'default',
  [Es3afniStatus.PENDING]: 'warning',
  [Es3afniStatus.CONFIRMED]: 'info',
  [Es3afniStatus.COMPLETED]: 'success',
  [Es3afniStatus.CANCELLED]: 'error'
};

export interface Es3afniFilters {
  status?: Es3afniStatus;
  search?: string;
  bloodType?: string;
  dateFrom?: string;
  dateTo?: string;
}
