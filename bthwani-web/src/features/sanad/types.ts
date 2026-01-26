// src/features/sanad/types.ts
export type SanadStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type SanadKind = 'specialist' | 'emergency' | 'charity';

export interface SanadItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind: SanadKind;
  metadata?: Record<string, any>;
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

export interface CreateSanadPayload {
  title: string;
  description?: string;
  kind: SanadKind;
  metadata?: Record<string, any>;
}

export interface UpdateSanadPayload {
  title?: string;
  description?: string;
  kind?: SanadKind;
  metadata?: Record<string, any>;
  status?: SanadStatus;
}

export interface SanadFilters {
  status?: SanadStatus;
  kind?: SanadKind;
  search?: string;
}

export interface SanadListResponse {
  items: SanadItem[];
  nextCursor?: string;
}

export interface SanadSearchParams {
  q: string;
  kind?: SanadKind;
  cursor?: string;
}

// ترجمة حالات السند للعربية
export const SanadStatusLabels: Record<SanadStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ترجمة أنواع السند للعربية
export const SanadKindLabels: Record<SanadKind, string> = {
  specialist: 'خدمات متخصصة',
  emergency: 'فزعة',
  charity: 'خيري'
};

// ألوان حالات السند
export const SanadStatusColors: Record<SanadStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

// ألوان أنواع السند
export const SanadKindColors: Record<SanadKind, string> = {
  specialist: '#3f51b5',
  emergency: '#f44336',
  charity: '#4caf50'
};

// Array of all SanadKind values for iteration
export const SanadKindValues: SanadKind[] = ['specialist', 'emergency', 'charity'];

// Array of all SanadStatus values for iteration
export const SanadStatusValues: SanadStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];
