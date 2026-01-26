// src/features/es3afni/types.ts
export type Es3afniStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Es3afniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: BloodType;
  location?: Location;
  metadata?: Record<string, any>;
  status: Es3afniStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateEs3afniPayload {
  title: string;
  description?: string;
  bloodType?: BloodType;
  location?: Location;
  metadata?: Record<string, any>;
}

export interface UpdateEs3afniPayload {
  title?: string;
  description?: string;
  bloodType?: BloodType;
  location?: Location;
  metadata?: Record<string, any>;
  status?: Es3afniStatus;
}

export interface Es3afniFilters {
  status?: Es3afniStatus;
  bloodType?: BloodType;
  search?: string;
}

export interface Es3afniListResponse {
  items: Es3afniItem[];
  nextCursor?: string;
}

// ترجمة حالات الاسعفني للعربية
export const Es3afniStatusLabels: Record<Es3afniStatus, string> = {
  draft: 'مسودة',
  pending: 'في الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ترجمة فصائل الدم للعربية
export const BloodTypeLabels: Record<BloodType, string> = {
  'A+': 'A+',
  'A-': 'A-',
  'B+': 'B+',
  'B-': 'B-',
  'AB+': 'AB+',
  'AB-': 'AB-',
  'O+': 'O+',
  'O-': 'O-'
};

// ألوان حالات الاسعفني
export const Es3afniStatusColors: Record<Es3afniStatus, string> = {
  draft: '#9e9e9e',
  pending: '#ff9800',
  confirmed: '#2196f3',
  completed: '#4caf50',
  cancelled: '#f44336'
};

// ألوان فصائل الدم
export const BloodTypeColors: Record<BloodType, string> = {
  'A+': '#f44336',
  'A-': '#d32f2f',
  'B+': '#2196f3',
  'B-': '#1976d2',
  'AB+': '#4caf50',
  'AB-': '#388e3c',
  'O+': '#ff9800',
  'O-': '#f57c00'
};

// Array of all Es3afniStatus values for iteration
export const Es3afniStatusValues: Es3afniStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];

// Array of all BloodType values for iteration
export const BloodTypeValues: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
