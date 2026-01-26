// أنواع بيانات قسم الصناد
export interface SanadItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata: Record<string, any>;
  status: SanadStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export enum SanadKind {
  SPECIALIST = 'specialist',
  EMERGENCY = 'emergency',
  CHARITY = 'charity'
}

export enum SanadStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة أنواع الصناد للعربية
export const SanadKindLabels: Record<SanadKind, string> = {
  [SanadKind.SPECIALIST]: 'متخصص',
  [SanadKind.EMERGENCY]: 'طوارئ',
  [SanadKind.CHARITY]: 'خيري'
};

// ترجمة حالات الصناد للعربية
export const SanadStatusLabels: Record<SanadStatus, string> = {
  [SanadStatus.DRAFT]: 'مسودة',
  [SanadStatus.PENDING]: 'في الانتظار',
  [SanadStatus.CONFIRMED]: 'مؤكد',
  [SanadStatus.COMPLETED]: 'مكتمل',
  [SanadStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات الصناد
export const SanadStatusColors: Record<SanadStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [SanadStatus.DRAFT]: 'default',
  [SanadStatus.PENDING]: 'warning',
  [SanadStatus.CONFIRMED]: 'info',
  [SanadStatus.COMPLETED]: 'success',
  [SanadStatus.CANCELLED]: 'error'
};

// ألوان أنواع الصناد
export const SanadKindColors: Record<SanadKind, 'blue' | 'error' | 'success'> = {
  [SanadKind.SPECIALIST]: 'blue',
  [SanadKind.EMERGENCY]: 'error',
  [SanadKind.CHARITY]: 'success'
};

export interface SanadFilters {
  status?: SanadStatus;
  kind?: SanadKind;
  ownerId?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface SanadStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  specialist: number;
  emergency: number;
  charity: number;
}

export interface SanadStatusUpdateRequest {
  status: SanadStatus;
  notes?: string;
}

export interface SanadListResponse {
  items: SanadItem[];
  nextCursor?: string;
}
