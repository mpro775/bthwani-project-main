// src/features/kenz/types.ts
export type KenzStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type KenzCategory = 'electronics' | 'clothing' | 'home' | 'vehicles' | 'books' | 'sports' | 'other';

export interface KenzItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  price?: number;
  category?: KenzCategory;
  metadata?: Record<string, any>;
  status: KenzStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateKenzPayload {
  title: string;
  description?: string;
  price?: number;
  category?: KenzCategory;
  metadata?: Record<string, any>;
}

export interface UpdateKenzPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: KenzCategory;
  metadata?: Record<string, any>;
  status?: KenzStatus;
}

export interface KenzFilters {
  status?: KenzStatus;
  category?: KenzCategory;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface KenzListResponse {
  items: KenzItem[];
  nextCursor?: string;
}

// ترجمة حالات الكنز للعربية
export const KenzStatusLabels: Record<KenzStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ترجمة فئات الكنز للعربية
export const KenzCategoryLabels: Record<KenzCategory, string> = {
  electronics: 'إلكترونيات',
  clothing: 'ملابس',
  home: 'منزل',
  vehicles: 'مركبات',
  books: 'كتب',
  sports: 'رياضة',
  other: 'أخرى'
};

// ألوان حالات الكنز
export const KenzStatusColors: Record<KenzStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

// ألوان فئات الكنز
export const KenzCategoryColors: Record<KenzCategory, string> = {
  electronics: '#2196f3',
  clothing: '#e91e63',
  home: '#4caf50',
  vehicles: '#ff9800',
  books: '#9c27b0',
  sports: '#00bcd4',
  other: '#607d8b'
};

// Array of all KenzStatus values for iteration
export const KenzStatusValues: KenzStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];

// Array of all KenzCategory values for iteration
export const KenzCategoryValues: KenzCategory[] = ['electronics', 'clothing', 'home', 'vehicles', 'books', 'sports', 'other'];
