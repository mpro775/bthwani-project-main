/**
 * Onboarding API
 * جميع الوظائف الخاصة بإدارة طلبات الانضمام
 */

import { useState, useEffect } from 'react';
import { useAdminAPI, useAdminQuery, useAdminMutation } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';

// ==================== Types ====================

export interface OnboardingApplication {
  _id: string;
  applicantType: 'driver' | 'store' | 'merchant';
  fullName: string;
  phone: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: {
    nationalId?: string;
    drivingLicense?: string;
    vehicleRegistration?: string;
    commercialRegister?: string;
  };
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveApplicationData {
  notes?: string;
}

export interface RejectApplicationData {
  reason: string;
  notes?: string;
}

// ==================== Endpoints ====================

const endpoints = {
  getAll: ALL_ADMIN_ENDPOINTS.find(ep => ep.id === 'admin-onboarding-all'),
  getById: ALL_ADMIN_ENDPOINTS.find(ep => ep.id === 'admin-onboarding-details'),
  approve: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'approveOnboardingApplication'),
  reject: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'rejectOnboardingApplication'),
  updateStatus: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'updateOnboardingStatus'),
  getStats: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getOnboardingStats'),
};

// ==================== Query Hooks ====================

/**
 * جلب جميع طلبات الانضمام
 */
export function useOnboardingApplications(query?: {
  page?: string;
  limit?: string;
  status?: string;
  applicantType?: string;
  search?: string;
}) {
  return useAdminQuery<{ data: OnboardingApplication[]; total: number; pages: number }>(
    endpoints.getAll!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب تفاصيل طلب محدد
 */
export function useOnboardingApplication(applicationId: string, enabled = true) {
  return useAdminQuery<{ data: OnboardingApplication }>(
    endpoints.getById!,
    { params: { id: applicationId } },
    { enabled: enabled && !!applicationId }
  );
}

/**
 * جلب إحصائيات طلبات الانضمام
 */
export function useOnboardingStats() {
  return useAdminQuery<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    underReview: number;
    byType: Record<string, number>;
  }>(endpoints.getStats!, {}, { enabled: true });
}

// ==================== Mutation Hooks ====================

/**
 * الموافقة على طلب انضمام
 */
export function useApproveApplication(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation<OnboardingApplication, ApproveApplicationData>(
    endpoints.approve!,
    options
  );
}

/**
 * رفض طلب انضمام
 */
export function useRejectApplication(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation<OnboardingApplication, RejectApplicationData>(
    endpoints.reject!,
    options
  );
}

/**
 * تحديث حالة طلب
 */
export function useUpdateApplicationStatus(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation(endpoints.updateStatus!, options);
}

// ==================== Direct API Calls ====================

/**
 * استخدام مباشر للـ API بدون hooks
 */
export function useOnboardingAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    /**
     * جلب جميع الطلبات
     */
    getAll: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: OnboardingApplication[]; total: number }>(
        endpoints.getAll!,
        { query }
      );
    },

    /**
     * جلب تفاصيل طلب
     */
    getById: async (applicationId: string) => {
      return callEndpoint<{ data: OnboardingApplication }>(
        endpoints.getById!,
        { params: { id: applicationId } }
      );
    },

    /**
     * الموافقة على طلب
     */
    approve: async (applicationId: string, data?: ApproveApplicationData) => {
      return callEndpoint<{ data: OnboardingApplication }>(
        endpoints.approve!,
        { params: { id: applicationId }, body: data }
      );
    },

    /**
     * رفض طلب
     */
    reject: async (applicationId: string, data: RejectApplicationData) => {
      return callEndpoint<{ data: OnboardingApplication }>(
        endpoints.reject!,
        { params: { id: applicationId }, body: data }
      );
    },

    /**
     * تحديث حالة طلب
     */
    updateStatus: async (applicationId: string, status: string) => {
      return callEndpoint(
        endpoints.updateStatus!,
        { params: { id: applicationId }, body: { status } }
      );
    },

    /**
     * جلب الإحصائيات
     */
    getStats: async () => {
      return callEndpoint<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
      }>(endpoints.getStats!);
    },
  };
}

/**
 * Hook متوافق مع النظام القديم - للصفحة القائمة
 * يوفر نفس API القديم لكن يستخدم useAdminAPI من الخلف
 */
export function useOnboardingLegacy() {
  const { callEndpoint } = useAdminAPI();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const list = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await callEndpoint(endpoints.getAll!, { query: params });
      setRows(response?.data || response || []);
    } catch (e) {
      console.error('Failed to fetch onboarding:', e);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string, vendorPassword?: string) => {
    setLoading(true);
    try {
      await callEndpoint(endpoints.approve!, {
        params: { id },
        body: { vendorPassword, notes: 'تمت الموافقة' },
      });
      await list();
    } catch (e) {
      console.error('Failed to approve:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string, reason: string) => {
    setLoading(true);
    try {
      await callEndpoint(endpoints.reject!, {
        params: { id },
        body: { reason },
      });
      await list();
    } catch (e) {
      console.error('Failed to reject:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const needsFix = async (id: string, notes: string) => {
    setLoading(true);
    try {
      await callEndpoint(endpoints.updateStatus!, {
        params: { id },
        body: { status: 'under_review', notes },
      });
      await list();
    } catch (e) {
      console.error('Failed to mark needs fix:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند البدء
  useEffect(() => {
    list({ status: 'pending' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { rows, loading, list, approve, reject, needsFix };
}

