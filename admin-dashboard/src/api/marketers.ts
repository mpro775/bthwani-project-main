/**
 * Marketers API
 * جميع الوظائف الخاصة بإدارة المسوقين
 */

import { useState, useEffect } from 'react';
import { useAdminAPI, useAdminQuery, useAdminMutation } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';

// ==================== Types ====================

export interface Marketer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  commissionRate: number;
  totalCommissions: number;
  totalApplications: number;
  approvedApplications: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketerApplication {
  _id: string;
  marketerId: string;
  driverId: string;
  status: 'pending' | 'approved' | 'rejected';
  commissionAmount: number;
  createdAt: string;
}

export interface MarketerCommission {
  _id: string;
  marketerId: string;
  applicationId: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  createdAt: string;
}

export interface CreateMarketerData {
  name: string;
  phone: string;
  email?: string;
  commissionRate?: number;
}

export interface UpdateMarketerData {
  name?: string;
  phone?: string;
  email?: string;
  commissionRate?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

// ==================== Endpoints ====================

const endpoints = {
  getAll: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getAllMarketers'),
  getById: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getMarketerById'),
  create: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'createMarketer'),
  update: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'updateMarketer'),
  delete: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'deleteMarketer'),
  getApplications: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getMarketerApplications'),
  getCommissions: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getMarketerCommissions'),
};

// ==================== Query Hooks ====================

/**
 * جلب جميع المسوقين
 */
export function useMarketers(query?: {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
}) {
  return useAdminQuery<{ data: Marketer[]; total: number; pages: number }>(
    endpoints.getAll!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب تفاصيل مسوق محدد
 */
export function useMarketer(marketerId: string, enabled = true) {
  return useAdminQuery<{ data: Marketer }>(
    endpoints.getById!,
    { params: { id: marketerId } },
    { enabled: enabled && !!marketerId }
  );
}

/**
 * جلب طلبات مسوق محدد
 */
export function useMarketerApplications(marketerId: string, query?: {
  page?: string;
  limit?: string;
  status?: string;
}) {
  return useAdminQuery<{ data: MarketerApplication[]; total: number }>(
    endpoints.getApplications!,
    { params: { id: marketerId }, query },
    { enabled: !!marketerId }
  );
}

/**
 * جلب عمولات مسوق محدد
 */
export function useMarketerCommissions(marketerId: string, query?: {
  page?: string;
  limit?: string;
  status?: string;
}) {
  return useAdminQuery<{ data: MarketerCommission[]; total: number }>(
    endpoints.getCommissions!,
    { params: { id: marketerId }, query },
    { enabled: !!marketerId }
  );
}

// ==================== Mutation Hooks ====================

/**
 * إنشاء مسوق جديد
 */
export function useCreateMarketer(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation<Marketer, CreateMarketerData>(endpoints.create!, options);
}

/**
 * تحديث بيانات مسوق
 */
export function useUpdateMarketer(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation<Marketer, UpdateMarketerData>(endpoints.update!, options);
}

/**
 * حذف مسوق
 */
export function useDeleteMarketer(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation(endpoints.delete!, options);
}

// ==================== Direct API Calls ====================

/**
 * استخدام مباشر للـ API بدون hooks
 */
export function useMarketersAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    /**
     * جلب جميع المسوقين
     */
    getAll: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: Marketer[]; total: number }>(
        endpoints.getAll!,
        { query }
      );
    },

    /**
     * جلب تفاصيل مسوق
     */
    getById: async (marketerId: string) => {
      return callEndpoint<{ data: Marketer }>(
        endpoints.getById!,
        { params: { id: marketerId } }
      );
    },

    /**
     * إنشاء مسوق جديد
     */
    create: async (data: CreateMarketerData) => {
      return callEndpoint<{ data: Marketer }>(
        endpoints.create!,
        { body: data }
      );
    },

    /**
     * تحديث بيانات مسوق
     */
    update: async (marketerId: string, data: UpdateMarketerData) => {
      return callEndpoint<{ data: Marketer }>(
        endpoints.update!,
        { params: { id: marketerId }, body: data }
      );
    },

    /**
     * حذف مسوق
     */
    delete: async (marketerId: string) => {
      return callEndpoint(
        endpoints.delete!,
        { params: { id: marketerId } }
      );
    },

    /**
     * جلب طلبات المسوق
     */
    getApplications: async (marketerId: string, query?: Record<string, string>) => {
      return callEndpoint<{ data: MarketerApplication[]; total: number }>(
        endpoints.getApplications!,
        { params: { id: marketerId }, query }
      );
    },

    /**
     * جلب عمولات المسوق
     */
    getCommissions: async (marketerId: string, query?: Record<string, string>) => {
      return callEndpoint<{ data: MarketerCommission[]; total: number }>(
        endpoints.getCommissions!,
        { params: { id: marketerId }, query }
      );
    },
  };
}

/**
 * Hook متوافق مع النظام القديم - للصفحة القائمة
 * يوفر نفس API القديم لكن يستخدم useAdminAPI من الخلف
 */
export function useMarketersLegacy() {
  const { callEndpoint } = useAdminAPI();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await callEndpoint(endpoints.getAll!, { query: params });
      setRows(response?.data || response || []);
    } catch (e: any) {
      setError(e.message || 'فشل في جلب المسوّقين');
    } finally {
      setLoading(false);
    }
  };

  const create = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      await callEndpoint(endpoints.create!, { body: payload });
      await list();
    } catch (e: any) {
      setError(e.message || 'فشل إنشاء المسوّق');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const patch = async (id: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      await callEndpoint(endpoints.update!, { params: { id }, body: payload });
      await list();
    } catch (e: any) {
      setError(e.message || 'فشل تعديل المسوّق');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      await callEndpoint(endpoints.update!, {
        params: { id },
        body: { status },
      });
      await list();
    } catch (e: any) {
      setError(e.message || 'فشل تحديث الحالة');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (id: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // استخدام endpoint مخصص إذا كان متاحاً، أو update عادي
      await callEndpoint(endpoints.update!, {
        params: { id },
        body: { password },
      });
    } catch (e: any) {
      setError(e.message || 'فشل إعادة تعيين كلمة المرور');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('حذف المسوّق؟')) return;
    setLoading(true);
    setError(null);
    try {
      await callEndpoint(endpoints.delete!, { params: { id } });
      await list();
    } catch (e: any) {
      setError(e.message || 'فشل حذف المسوّق');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند البدء
  useEffect(() => {
    list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    rows,
    loading,
    error,
    list,
    create,
    patch,
    setStatus,
    resetPassword,
    remove,
  };
}

