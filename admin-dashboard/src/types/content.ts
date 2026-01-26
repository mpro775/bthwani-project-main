/**
 * Content Management Types
 * جميع الأنواع الخاصة بإدارة المحتوى
 */

// ==================== Banner Types ====================

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  placement: 'home' | 'category' | 'product' | 'checkout';
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clicks: number;
  impressions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  placement: 'home' | 'category' | 'product' | 'checkout';
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  placement?: 'home' | 'category' | 'product' | 'checkout';
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  totalClicks: number;
  totalImpressions: number;
  ctr: number; // Click-through rate
}

// ==================== CMS Page Types ====================

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'page' | 'terms' | 'privacy' | 'about';
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCMSPageDto {
  title: string;
  slug: string;
  content: string;
  type: 'page' | 'terms' | 'privacy' | 'about';
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateCMSPageDto {
  title?: string;
  slug?: string;
  content?: string;
  type?: 'page' | 'terms' | 'privacy' | 'about';
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// ==================== App Settings Types ====================

export interface AppSettings {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  minimumAppVersion: {
    ios: string;
    android: string;
  };
  forceUpdate: boolean;
  contactEmail: string;
  contactPhone: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    snapchat?: string;
  };
  deliveryFee: number;
  minimumOrderAmount: number;
  currency: string;
  taxRate: number;
  updatedBy?: string;
  updatedAt: string;
}

export interface UpdateAppSettingsDto {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  minimumAppVersion?: {
    ios?: string;
    android?: string;
  };
  forceUpdate?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    snapchat?: string;
  };
  deliveryFee?: number;
  minimumOrderAmount?: number;
  currency?: string;
  taxRate?: number;
}

// ==================== FAQ Types ====================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'orders' | 'delivery' | 'payment' | 'account';
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQDto {
  question: string;
  answer: string;
  category: 'general' | 'orders' | 'delivery' | 'payment' | 'account';
  priority?: number;
  isActive?: boolean;
}

export interface UpdateFAQDto {
  question?: string;
  answer?: string;
  category?: 'general' | 'orders' | 'delivery' | 'payment' | 'account';
  priority?: number;
  isActive?: boolean;
}

// ==================== Subscription Plan Types ====================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  features?: string[];
  isActive?: boolean;
}

// ==================== Response Types ====================

export interface ContentResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedContentResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Query Types ====================

export interface BannerQuery {
  placement?: 'home' | 'category' | 'product' | 'checkout';
  isActive?: boolean;
}

export interface CMSPageQuery {
  type?: 'page' | 'terms' | 'privacy' | 'about';
  isPublished?: boolean;
}

export interface FAQQuery {
  category?: 'general' | 'orders' | 'delivery' | 'payment' | 'account';
  isActive?: boolean;
}

