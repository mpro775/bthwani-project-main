// أنواع بيانات قسم الأماني
export interface AmaniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  origin?: {
    lat: number;
    lng: number;
    address: string;
  };
  destination?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata: Record<string, any>;
  status: AmaniStatus;
  createdAt: string;
  updatedAt: string;
}

export enum AmaniStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة حالات الأماني للعربية
export const AmaniStatusLabels: Record<AmaniStatus, string> = {
  [AmaniStatus.DRAFT]: 'مسودة',
  [AmaniStatus.PENDING]: 'في الانتظار',
  [AmaniStatus.CONFIRMED]: 'مؤكد',
  [AmaniStatus.IN_PROGRESS]: 'قيد التنفيذ',
  [AmaniStatus.COMPLETED]: 'مكتمل',
  [AmaniStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات الأماني
export const AmaniStatusColors: Record<AmaniStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [AmaniStatus.DRAFT]: 'default',
  [AmaniStatus.PENDING]: 'warning',
  [AmaniStatus.CONFIRMED]: 'info',
  [AmaniStatus.IN_PROGRESS]: 'primary',
  [AmaniStatus.COMPLETED]: 'success',
  [AmaniStatus.CANCELLED]: 'error'
};

export interface AmaniFilters {
  status?: AmaniStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
