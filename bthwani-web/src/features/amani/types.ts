// src/features/amani/types.ts
export type AmaniStatus = 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface AmaniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  origin?: Location;
  destination?: Location;
  metadata?: Record<string, any>;
  status: AmaniStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateAmaniPayload {
  title: string;
  description?: string;
  origin?: Location;
  destination?: Location;
  metadata?: Record<string, any>;
}

export interface UpdateAmaniPayload {
  title?: string;
  description?: string;
  origin?: Location;
  destination?: Location;
  metadata?: Record<string, any>;
  status?: AmaniStatus;
}

export interface AmaniFilters {
  status?: AmaniStatus;
  search?: string;
}

export interface AmaniListResponse {
  items: AmaniItem[];
  nextCursor?: string;
}

// ترجمة حالات الأماني للعربية
export const AmaniStatusLabels: Record<AmaniStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ألوان حالات الأماني
export const AmaniStatusColors: Record<AmaniStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  in_progress: '#ff5722',
  completed: '#4caf50',
  cancelled: '#f44336'
};

// Array of all AmaniStatus values for iteration
export const AmaniStatusValues: AmaniStatus[] = ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
