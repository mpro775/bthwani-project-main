// أنواع بيانات قسم معروف
export interface MaaroufItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata: Record<string, any>;
  status: MaaroufStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export enum MaaroufKind {
  LOST = 'lost',
  FOUND = 'found'
}

export enum MaaroufStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة أنواع معروف للعربية
export const MaaroufKindLabels: Record<MaaroufKind, string> = {
  [MaaroufKind.LOST]: 'مفقود',
  [MaaroufKind.FOUND]: 'موجود'
};

// ترجمة حالات معروف للعربية
export const MaaroufStatusLabels: Record<MaaroufStatus, string> = {
  [MaaroufStatus.DRAFT]: 'مسودة',
  [MaaroufStatus.PENDING]: 'في الانتظار',
  [MaaroufStatus.CONFIRMED]: 'مؤكد',
  [MaaroufStatus.COMPLETED]: 'مكتمل',
  [MaaroufStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات معروف
export const MaaroufStatusColors: Record<MaaroufStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [MaaroufStatus.DRAFT]: 'default',
  [MaaroufStatus.PENDING]: 'warning',
  [MaaroufStatus.CONFIRMED]: 'info',
  [MaaroufStatus.COMPLETED]: 'success',
  [MaaroufStatus.CANCELLED]: 'error'
};

// ألوان أنواع معروف
export const MaaroufKindColors: Record<MaaroufKind, 'error' | 'success'> = {
  [MaaroufKind.LOST]: 'error',
  [MaaroufKind.FOUND]: 'success'
};

export interface MaaroufFilters {
  status?: MaaroufStatus;
  kind?: MaaroufKind;
  ownerId?: string;
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface MaaroufStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  lost: number;
  found: number;
}

export interface MaaroufStatusUpdateRequest {
  status: MaaroufStatus;
  notes?: string;
}

export interface MaaroufListResponse {
  items: MaaroufItem[];
  nextCursor?: string;
}
