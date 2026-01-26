// src/features/maarouf/types.ts
export type MaaroufKind = 'lost' | 'found';

export type MaaroufStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface MaaroufItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind: MaaroufKind;
  tags?: string[];
  metadata?: Record<string, any>;
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

export interface CreateMaaroufPayload {
  title: string;
  description?: string;
  kind: MaaroufKind;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMaaroufPayload {
  title?: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: Record<string, any>;
  status?: MaaroufStatus;
}

export interface MaaroufFilters {
  kind?: MaaroufKind;
  status?: MaaroufStatus;
  search?: string;
  tags?: string[];
}

export interface MaaroufListResponse {
  items: MaaroufItem[];
  nextCursor?: string;
}

// ترجمة الأنواع للعربية
export const MaaroufKindLabels: Record<MaaroufKind, string> = {
  lost: 'مفقود',
  found: 'موجود'
};

export const MaaroufStatusLabels: Record<MaaroufStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ألوان الحالات والأنواع
export const MaaroufStatusColors: Record<MaaroufStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

export const MaaroufKindColors: Record<MaaroufKind, string> = {
  lost: '#f44336',
  found: '#4caf50'
};

// Array of all MaaroufKind values for iteration
export const MaaroufKindValues: MaaroufKind[] = ['lost', 'found'];

// Array of all MaaroufStatus values for iteration
export const MaaroufStatusValues: MaaroufStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];
