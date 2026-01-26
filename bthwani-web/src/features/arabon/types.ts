// src/features/arabon/types.ts
export type ArabonStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ArabonItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: Record<string, any>;
  status: ArabonStatus;
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
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateArabonPayload {
  title?: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: Record<string, any>;
  status?: ArabonStatus;
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
