// أنواع بيانات قسم العربون
export interface ArabonItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata: Record<string, any>;
  status: ArabonStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ArabonStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة حالات العربون للعربية
export const ArabonStatusLabels: Record<ArabonStatus, string> = {
  [ArabonStatus.DRAFT]: 'مسودة',
  [ArabonStatus.PENDING]: 'في الانتظار',
  [ArabonStatus.CONFIRMED]: 'مؤكد',
  [ArabonStatus.COMPLETED]: 'مكتمل',
  [ArabonStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات العربون
export const ArabonStatusColors: Record<ArabonStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [ArabonStatus.DRAFT]: 'default',
  [ArabonStatus.PENDING]: 'warning',
  [ArabonStatus.CONFIRMED]: 'info',
  [ArabonStatus.COMPLETED]: 'success',
  [ArabonStatus.CANCELLED]: 'error'
};

export interface ArabonFilters {
  status?: ArabonStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
