// أنواع بيانات قسم الكوادر
export interface KawaderItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata: Record<string, any>;
  status: KawaderStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export enum KawaderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة حالات الكوادر للعربية
export const KawaderStatusLabels: Record<KawaderStatus, string> = {
  [KawaderStatus.DRAFT]: 'مسودة',
  [KawaderStatus.PENDING]: 'في الانتظار',
  [KawaderStatus.CONFIRMED]: 'مؤكد',
  [KawaderStatus.COMPLETED]: 'مكتمل',
  [KawaderStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات الكوادر
export const KawaderStatusColors: Record<KawaderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [KawaderStatus.DRAFT]: 'default',
  [KawaderStatus.PENDING]: 'warning',
  [KawaderStatus.CONFIRMED]: 'info',
  [KawaderStatus.COMPLETED]: 'success',
  [KawaderStatus.CANCELLED]: 'error'
};

export interface KawaderFilters {
  status?: KawaderStatus;
  ownerId?: string;
  budgetMin?: number;
  budgetMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface KawaderStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface KawaderStatusUpdateRequest {
  status: KawaderStatus;
  notes?: string;
}

export interface KawaderListResponse {
  items: KawaderItem[];
  nextCursor?: string;
}
