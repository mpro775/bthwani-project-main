// أنواع بيانات قسم الكنز
export interface KenzItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata: Record<string, any>;
  status: KenzStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  postedOnBehalfOfPhone?: string;
  postedOnBehalfOfUserId?: string | { _id: string; name?: string; phone?: string };
  isAuction?: boolean;
  auctionEndAt?: string;
  startingPrice?: number;
  winnerId?: string | { _id: string; fullName?: string; phone?: string };
  winningBidAmount?: number;
  acceptsEscrow?: boolean;
}

export enum KenzStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ترجمة حالات الكنز للعربية
export const KenzStatusLabels: Record<KenzStatus, string> = {
  [KenzStatus.DRAFT]: 'مسودة',
  [KenzStatus.PENDING]: 'في الانتظار',
  [KenzStatus.CONFIRMED]: 'مؤكد',
  [KenzStatus.COMPLETED]: 'مكتمل',
  [KenzStatus.CANCELLED]: 'ملغي'
};

// ألوان حالات الكنز
export const KenzStatusColors: Record<KenzStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [KenzStatus.DRAFT]: 'default',
  [KenzStatus.PENDING]: 'warning',
  [KenzStatus.CONFIRMED]: 'info',
  [KenzStatus.COMPLETED]: 'success',
  [KenzStatus.CANCELLED]: 'error'
};

export type KenzSortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

export interface KenzFilters {
  status?: KenzStatus;
  ownerId?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  sort?: KenzSortOption;
}

export interface KenzStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface KenzStatusUpdateRequest {
  status: KenzStatus;
  notes?: string;
}

export interface KenzListResponse {
  items: KenzItem[];
  nextCursor?: string;
}

// فئات الكنز الشائعة
export const KenzCategories = [
  'إلكترونيات',
  'ملابس',
  'أثاث',
  'سيارات',
  'عقارات',
  'خدمات',
  'أخرى'
];
