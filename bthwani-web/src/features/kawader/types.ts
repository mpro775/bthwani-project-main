// src/features/kawader/types.ts
export type KawaderStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface KawaderItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: Record<string, any>;
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

export interface CreateKawaderPayload {
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: Record<string, any>;
}

export interface UpdateKawaderPayload {
  title?: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: Record<string, any>;
  status?: KawaderStatus;
}

export interface KawaderFilters {
  status?: KawaderStatus;
  search?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface KawaderListResponse {
  items: KawaderItem[];
  nextCursor?: string;
}

// ترجمة حالات الكوادر للعربية
export const KawaderStatusLabels: Record<KawaderStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ألوان حالات الكوادر
export const KawaderStatusColors: Record<KawaderStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

// Array of all KawaderStatus values for iteration
export const KawaderStatusValues: KawaderStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];
