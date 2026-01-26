/**
 * Analytics API
 * جميع الوظائف الخاصة بالتحليلات والإحصائيات
 */

import { useAdminAPI, useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';

// ==================== Types ====================

export interface SystemMetrics {
  totalUsers: number;
  activeDrivers: number;
  activeStores: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface DriverAnalytics {
  totalDrivers: number;
  activeDrivers: number;
  inactiveDrivers: number;
  suspendedDrivers: number;
  averageRating: number;
  topDrivers: Array<{
    driverId: string;
    name: string;
    completedOrders: number;
    rating: number;
    earnings: number;
  }>;
}

export interface StoreAnalytics {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  averageRating: number;
  topStores: Array<{
    storeId: string;
    name: string;
    totalOrders: number;
    rating: number;
    revenue: number;
  }>;
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  averageDeliveryTime: number;
  ordersByStatus: Record<string, number>;
  ordersByHour: Array<{ hour: number; count: number }>;
  ordersByDay: Array<{ day: string; count: number }>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByDay: Array<{ date: string; amount: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
  revenueByCategory: Record<string, number>;
}

// ==================== Endpoints ====================

const endpoints = {
  getSystemMetrics: ALL_ADMIN_ENDPOINTS.find(ep => ep.id === 'admin-analytics-system-metrics'),
  getDriverAnalytics: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getDriverAnalytics'),
  getStoreAnalytics: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getStoreAnalytics'),
  getOrderAnalytics: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getOrderAnalytics'),
  getRevenueAnalytics: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getRevenueAnalytics'),
  getUserGrowth: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getUserGrowth'),
  getPerformanceMetrics: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getPerformanceMetrics'),
  exportAnalytics: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'exportAnalytics'),
  getDashboardStats: ALL_ADMIN_ENDPOINTS.find(ep => ep.id === 'admin-dashboard'),
};

// ==================== Query Hooks ====================

/**
 * جلب مقاييس النظام العامة
 */
export function useSystemMetrics(query?: {
  startDate?: string;
  endDate?: string;
}) {
  return useAdminQuery<{ data: SystemMetrics }>(
    endpoints.getSystemMetrics!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب تحليلات السائقين
 */
export function useDriverAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  limit?: string;
}) {
  return useAdminQuery<{ data: DriverAnalytics }>(
    endpoints.getDriverAnalytics!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب تحليلات المتاجر
 */
export function useStoreAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  limit?: string;
}) {
  return useAdminQuery<{ data: StoreAnalytics }>(
    endpoints.getStoreAnalytics!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب تحليلات الطلبات
 */
export function useOrderAnalytics(query?: {
  startDate?: string;
  endDate?: string;
}) {
  return useAdminQuery<{ data: OrderAnalytics }>(
    endpoints.getOrderAnalytics!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب تحليلات الإيرادات
 */
export function useRevenueAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}) {
  return useAdminQuery<{ data: RevenueAnalytics }>(
    endpoints.getRevenueAnalytics!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب نمو المستخدمين
 */
export function useUserGrowth(query?: {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}) {
  return useAdminQuery<{
    data: Array<{
      date: string;
      totalUsers: number;
      newUsers: number;
      activeUsers: number;
    }>;
  }>(endpoints.getUserGrowth!, { query }, { enabled: true });
}

/**
 * جلب مقاييس الأداء
 */
export function usePerformanceMetrics(query?: {
  startDate?: string;
  endDate?: string;
}) {
  return useAdminQuery<{
    data: {
      averageResponseTime: number;
      averageDeliveryTime: number;
      successRate: number;
      cancellationRate: number;
    };
  }>(endpoints.getPerformanceMetrics!, { query }, { enabled: true });
}

/**
 * جلب إحصائيات لوحة التحكم
 */
export function useDashboardStats() {
  return useAdminQuery<{
    data: {
      totalDrivers: number;
      activeDrivers: number;
      totalStores: number;
      activeStores: number;
      totalOrders: number;
      todayOrders: number;
      totalRevenue: number;
      pendingWithdrawals: number;
    };
  }>(endpoints.getDashboardStats!, {}, { enabled: true });
}

// ==================== Direct API Calls ====================

/**
 * استخدام مباشر للـ API بدون hooks
 */
export function useAnalyticsAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    /**
     * جلب مقاييس النظام
     */
    getSystemMetrics: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: SystemMetrics }>(
        endpoints.getSystemMetrics!,
        { query }
      );
    },

    /**
     * جلب تحليلات السائقين
     */
    getDriverAnalytics: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: DriverAnalytics }>(
        endpoints.getDriverAnalytics!,
        { query }
      );
    },

    /**
     * جلب تحليلات المتاجر
     */
    getStoreAnalytics: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: StoreAnalytics }>(
        endpoints.getStoreAnalytics!,
        { query }
      );
    },

    /**
     * جلب تحليلات الطلبات
     */
    getOrderAnalytics: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: OrderAnalytics }>(
        endpoints.getOrderAnalytics!,
        { query }
      );
    },

    /**
     * جلب تحليلات الإيرادات
     */
    getRevenueAnalytics: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: RevenueAnalytics }>(
        endpoints.getRevenueAnalytics!,
        { query }
      );
    },

    /**
     * جلب نمو المستخدمين
     */
    getUserGrowth: async (query?: Record<string, string>) => {
      return callEndpoint(endpoints.getUserGrowth!, { query });
    },

    /**
     * جلب مقاييس الأداء
     */
    getPerformanceMetrics: async (query?: Record<string, string>) => {
      return callEndpoint(endpoints.getPerformanceMetrics!, { query });
    },

    /**
     * تصدير التحليلات
     */
    exportAnalytics: async (format: 'csv' | 'excel' | 'pdf', query?: Record<string, string>) => {
      return callEndpoint(
        endpoints.exportAnalytics!,
        { query: { ...query, format } }
      );
    },

    /**
     * جلب إحصائيات لوحة التحكم
     */
    getDashboardStats: async () => {
      return callEndpoint(endpoints.getDashboardStats!);
    },
  };
}

