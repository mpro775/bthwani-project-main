/**
 * Finance API
 * جميع الوظائف الخاصة بالنظام المالي
 */

import { useAdminAPI, useAdminQuery, useAdminMutation } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import axiosInstance from '../utils/axios';

// ==================== Types ====================

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  completedPayments: number;
  period: string;
}

export interface Commission {
  _id: string;
  type: 'driver' | 'marketer' | 'store';
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  orderId?: string;
  applicationId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CommissionPlan {
  _id: string;
  name: string;
  type: 'driver' | 'marketer' | 'store';
  rate: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCommissionPlanData {
  name: string;
  type: 'driver' | 'marketer' | 'store';
  rate: number;
  minAmount?: number;
  maxAmount?: number;
}

// ==================== Wallet Statement Types ====================

export interface WalletAccount {
  id: string;
  owner_type: 'driver' | 'vendor';
  currency: string;
  status: 'active' | 'inactive';
}

export interface WalletBalance {
  pending_amount: number;
  available_amount: number;
  total_amount: number;
}

export interface WalletBalanceResponse {
  account: WalletAccount;
  balance: WalletBalance;
}

export interface StatementLine {
  _id: string;
  date: string;
  memo: string;
  side: 'credit' | 'debit';
  amount: number;
  ref_type: string;
  ref_id?: string;
  balance_state: 'available' | 'pending';
  running_balance: number;
}

export interface WalletStatementResponse {
  statement_lines: StatementLine[];
}

// ==================== Endpoints ====================

const endpoints = {
  getReport: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getFinancialReport'),
  getCommissions: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getAllCommissions'),
  payCommission: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'payCommission'),
  getPlans: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getCommissionPlans'),
  createPlan: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'createCommissionPlan'),
  updatePlan: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'updateCommissionPlan'),
  deletePlan: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'deleteCommissionPlan'),
  getStats: ALL_ADMIN_ENDPOINTS.find(ep => ep.handler === 'getFinanceStats'),
};

// ==================== Query Hooks ====================

/**
 * جلب التقرير المالي
 */
export function useFinancialReport(query?: {
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  return useAdminQuery<{ data: FinancialReport }>(
    endpoints.getReport!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب جميع العمولات
 */
export function useCommissions(query?: {
  page?: string;
  limit?: string;
  status?: string;
  type?: string;
}) {
  return useAdminQuery<{ data: Commission[]; total: number }>(
    endpoints.getCommissions!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب خطط العمولات
 */
export function useCommissionPlans(query?: {
  type?: string;
  isActive?: string;
}) {
  return useAdminQuery<{ data: CommissionPlan[]; total: number }>(
    endpoints.getPlans!,
    { query },
    { enabled: true }
  );
}

/**
 * جلب إحصائيات مالية
 */
export function useFinanceStats() {
  return useAdminQuery<{
    totalRevenue: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
  }>(endpoints.getStats!, {}, { enabled: true });
}

// ==================== Mutation Hooks ====================

/**
 * دفع عمولة
 */
export function usePayCommission(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation(endpoints.payCommission!, options);
}

/**
 * إنشاء خطة عمولة جديدة
 */
export function useCreateCommissionPlan(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation<CommissionPlan, CreateCommissionPlanData>(
    endpoints.createPlan!,
    options
  );
}

/**
 * تحديث خطة عمولة
 */
export function useUpdateCommissionPlan(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation(endpoints.updatePlan!, options);
}

/**
 * حذف خطة عمولة
 */
export function useDeleteCommissionPlan(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useAdminMutation(endpoints.deletePlan!, options);
}

// ==================== Direct API Calls ====================

/**
 * استخدام مباشر للـ API بدون hooks
 */
export function useFinanceAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    /**
     * جلب التقرير المالي
     */
    getReport: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: FinancialReport }>(
        endpoints.getReport!,
        { query }
      );
    },

    /**
     * جلب جميع العمولات
     */
    getCommissions: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: Commission[]; total: number }>(
        endpoints.getCommissions!,
        { query }
      );
    },

    /**
     * دفع عمولة
     */
    payCommission: async (commissionId: string) => {
      return callEndpoint(
        endpoints.payCommission!,
        { params: { id: commissionId } }
      );
    },

    /**
     * جلب خطط العمولات
     */
    getPlans: async (query?: Record<string, string>) => {
      return callEndpoint<{ data: CommissionPlan[] }>(
        endpoints.getPlans!,
        { query }
      );
    },

    /**
     * إنشاء خطة عمولة
     */
    createPlan: async (data: CreateCommissionPlanData) => {
      return callEndpoint<{ data: CommissionPlan }>(
        endpoints.createPlan!,
        { body: data }
      );
    },

    /**
     * تحديث خطة عمولة
     */
    updatePlan: async (planId: string, data: Partial<CreateCommissionPlanData>) => {
      return callEndpoint<{ data: CommissionPlan }>(
        endpoints.updatePlan!,
        { params: { id: planId }, body: data }
      );
    },

    /**
     * حذف خطة عمولة
     */
    deletePlan: async (planId: string) => {
      return callEndpoint(
        endpoints.deletePlan!,
        { params: { id: planId } }
      );
    },

    /**
     * جلب الإحصائيات المالية
     */
    getStats: async () => {
      return callEndpoint<{
        totalRevenue: number;
        totalCommissions: number;
        pendingCommissions: number;
      }>(endpoints.getStats!);
    },
  };
}

// ==================== Wallet Statement Functions ====================

/**
 * جلب رصيد المحفظة
 */
export async function getWalletBalance(): Promise<WalletBalanceResponse> {
  const { data } = await axiosInstance.get<WalletBalanceResponse>('/v2/wallet/balance', {
    headers: { 'x-silent-401': '1' }
  });
  return data;
}

/**
 * جلب كشف المحفظة
 */
export async function getWalletStatement(
  accountId: string,
  params?: {
    date_from?: string;
    date_to?: string;
    balance_state?: 'available' | 'pending';
  }
): Promise<WalletStatementResponse> {
  const { data } = await axiosInstance.get<WalletStatementResponse>(
    `/v2/wallet/statement/${accountId}`,
    {
      params: {
        date_from: params?.date_from,
        date_to: params?.date_to,
        balance_state: params?.balance_state,
      },
      headers: { 'x-silent-401': '1' }
    }
  );
  return data;
}

/**
 * تصدير كشف المحفظة إلى CSV
 */
export async function exportWalletStatementToCSV(
  accountId: string,
  params?: {
    date_from?: string;
    date_to?: string;
    balance_state?: 'available' | 'pending';
  }
): Promise<Blob> {
  const response = await axiosInstance.get(
    `/v2/wallet/statement/${accountId}/export`,
    {
      params: {
        date_from: params?.date_from,
        date_to: params?.date_to,
        balance_state: params?.balance_state,
      },
      responseType: 'blob',
      headers: { 'x-silent-401': '1' }
    }
  );
  return response.data;
}

// ==================== Report Export Types ====================

export interface ExportReportParams {
  startDate: string;
  endDate: string;
  storeId?: string;
  status?: string;
  format: 'csv' | 'excel';
}

export interface DataSummaryParams {
  startDate: string;
  endDate: string;
  reportType: 'sales' | 'payouts' | 'orders';
  storeId?: string;
  status?: string;
}

export interface DataSummaryResponse {
  summary: {
    totalAmount: number;
    totalRecords: number;
  };
}

export interface ValidationParams {
  reportType: 'sales' | 'payouts' | 'orders';
  startDate: string;
  endDate: string;
  uiTotal: number;
  uiCount: number;
  storeId?: string;
  status?: string;
}

export interface ValidationResponse {
  consistency: {
    totalMatch: boolean;
    countMatch: boolean;
    fileTotal: number;
    uiTotal: number;
    fileCount: number;
    uiCount: number;
    totalDifference: number;
    countDifference: number;
  };
}

// ==================== Report Export Functions ====================

/**
 * تصدير تقرير المبيعات
 */
export async function exportSalesReport(params: ExportReportParams): Promise<Blob> {
  const response = await axiosInstance.get('/admin/reports/export/sales', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      storeId: params.storeId,
      status: params.status,
      format: params.format,
    },
    responseType: 'blob',
    headers: { 'x-silent-401': '1' }
  });
  return response.data;
}

/**
 * تصدير تقرير المدفوعات
 */
export async function exportPayoutsReport(params: ExportReportParams): Promise<Blob> {
  const response = await axiosInstance.get('/admin/reports/export/payouts', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      storeId: params.storeId,
      status: params.status,
      format: params.format,
    },
    responseType: 'blob',
    headers: { 'x-silent-401': '1' }
  });
  return response.data;
}

/**
 * تصدير تقرير الطلبات
 */
export async function exportOrdersReport(params: ExportReportParams): Promise<Blob> {
  const response = await axiosInstance.get('/admin/reports/export/orders', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      storeId: params.storeId,
      status: params.status,
      format: params.format,
    },
    responseType: 'blob',
    headers: { 'x-silent-401': '1' }
  });
  return response.data;
}

/**
 * تصدير تقرير الرسوم والضرائب
 */
export async function exportFeesTaxesReport(params: ExportReportParams): Promise<Blob> {
  const response = await axiosInstance.get('/admin/reports/export/fees-taxes', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      storeId: params.storeId,
      status: params.status,
      format: params.format,
    },
    responseType: 'blob',
    headers: { 'x-silent-401': '1' }
  });
  return response.data;
}

/**
 * تصدير تقرير المرتجعات
 */
export async function exportRefundsReport(params: ExportReportParams): Promise<Blob> {
  const response = await axiosInstance.get('/admin/reports/export/refunds', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      storeId: params.storeId,
      status: params.status,
      format: params.format,
    },
    responseType: 'blob',
    headers: { 'x-silent-401': '1' }
  });
  return response.data;
}

/**
 * جلب ملخص البيانات للتقرير
 */
export async function getDataSummary(params: DataSummaryParams): Promise<DataSummaryResponse> {
  const { data } = await axiosInstance.get<DataSummaryResponse>('/admin/reports/data-summary', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      reportType: params.reportType,
      storeId: params.storeId,
      status: params.status,
    },
    headers: { 'x-silent-401': '1' }
  });
  return data;
}

/**
 * التحقق من مطابقة البيانات
 */
export async function validateDataConsistency(params: ValidationParams): Promise<ValidationResponse> {
  const { data } = await axiosInstance.post<ValidationResponse>('/admin/reports/validate', params, {
    headers: { 'x-silent-401': '1' }
  });
  return data;
}

// ==================== Payout Batch Types ====================

export interface PayoutBatch {
  _id: string;
  id: string;
  status: 'draft' | 'processing' | 'paid';
  currency: string;
  period_start: string;
  period_end: string;
  total_count: number;
  total_amount: number;
  createdAt: string;
  processed_at?: string;
  notes?: string;
}

export interface PayoutItem {
  _id: string;
  account_id: string | { owner_id: string };
  beneficiary: string;
  amount: number;
  fees: number;
  net_amount: number;
  status: 'pending' | 'processed' | 'failed';
}

export interface PayoutBatchDetailsResponse {
  items: PayoutItem[];
}

export interface PayoutBatchListResponse {
  batches: PayoutBatch[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    perPage: number;
  };
}

export interface GeneratePayoutBatchParams {
  period_start: string;
  period_end: string;
  min_amount?: number;
}

export interface GetPayoutBatchesParams {
  page?: number;
  perPage?: number;
  status?: string;
  date_from?: Date;
  date_to?: Date;
}

// ==================== Payout Batch Functions ====================

/**
 * جلب قائمة دفعات السائقين
 */
export async function getPayoutBatches(params?: GetPayoutBatchesParams): Promise<PayoutBatchListResponse> {
  const { data } = await axiosInstance.get<PayoutBatchListResponse>('/finance/payouts/batches', {
    params: {
      page: params?.page,
      perPage: params?.perPage,
      status: params?.status,
      date_from: params?.date_from?.toISOString(),
      date_to: params?.date_to?.toISOString(),
    },
    headers: { 'x-silent-401': '1' }
  });
  return data;
}

/**
 * جلب تفاصيل دفعة السائقين
 */
export async function getPayoutBatchDetails(batchId: string): Promise<PayoutBatchDetailsResponse> {
  const { data } = await axiosInstance.get<PayoutBatchDetailsResponse>(
    `/finance/payouts/batches/${batchId}/items`,
    {
      headers: { 'x-silent-401': '1' }
    }
  );
  return data;
}

/**
 * إنشاء دفعة سائقين جديدة
 */
export async function generatePayoutBatch(params: GeneratePayoutBatchParams): Promise<PayoutBatch> {
  const { data } = await axiosInstance.post<PayoutBatch>(
    '/finance/payouts/batches',
    {
      period_start: params.period_start,
      period_end: params.period_end,
      min_amount: params.min_amount,
    },
    {
      headers: { 'x-silent-401': '1' }
    }
  );
  return data;
}

/**
 * معالجة دفعة السائقين
 */
export async function processPayoutBatch(batchId: string): Promise<PayoutBatch> {
  const { data } = await axiosInstance.patch<PayoutBatch>(
    `/finance/payouts/batches/${batchId}/approve`,
    {},
    {
      headers: { 'x-silent-401': '1' }
    }
  );
  return data;
}

/**
 * تصدير دفعة السائقين إلى CSV
 */
export async function exportPayoutBatchToCSV(batchId: string): Promise<Blob> {
  const response = await axiosInstance.get(
    `/finance/payouts/batches/${batchId}/export`,
    {
      responseType: 'blob',
      headers: { 'x-silent-401': '1' }
    }
  );
  return response.data;
}
