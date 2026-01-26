/**
 * Finance System API - New
 * النظام المالي الكامل
 */

import { useAdminAPI, useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/finance';

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) throw new Error(`Endpoint "${id}" not found`);
  return endpoint;
};

// ==================== Payout Batches Hooks ====================

export function usePayoutBatches(query?: {
  status?: string;
  limit?: number;
  cursor?: string;
}) {
  const queryParams: Record<string, string> | undefined = query ? {
    ...(query.status && { status: query.status }),
    ...(query.limit !== undefined && { limit: query.limit.toString() }),
    ...(query.cursor && { cursor: query.cursor }),
  } : undefined;
  return useAdminQuery<Types.FinanceResponse<Types.PayoutBatch[]>>(
    getEndpoint('finance-payout-batches-all'),
    { query: queryParams },
    { enabled: true }
  );
}

export function usePayoutBatch(id: string) {
  return useAdminQuery<Types.FinanceResponse<Types.PayoutBatch>>(
    getEndpoint('finance-payout-batch-get'),
    { params: { id } },
    { enabled: !!id }
  );
}

export function usePayoutBatchItems(id: string) {
  return useAdminQuery<Types.FinanceResponse<Types.PayoutBatchItem[]>>(
    getEndpoint('finance-payout-batch-items'),
    { params: { id } },
    { enabled: !!id }
  );
}

// ==================== Settlements Hooks ====================

export function useEntitySettlements(entityId: string, entityModel: string, status?: string) {
  const queryParams: Record<string, string> = {
    entityModel,
    ...(status && { status }),
  };
  return useAdminQuery<Types.FinanceResponse<Types.Settlement[]>>(
    getEndpoint('finance-settlement-entity'),
    { params: { entityId }, query: queryParams },
    { enabled: !!entityId }
  );
}

export function useSettlement(id: string) {
  return useAdminQuery<Types.FinanceResponse<Types.Settlement>>(
    getEndpoint('finance-settlement-get'),
    { params: { id } },
    { enabled: !!id }
  );
}

// ==================== Coupons Hooks ====================

export function useCoupons(isActive?: boolean) {
  return useAdminQuery<Types.FinanceResponse<Types.FinancialCoupon[]>>(
    getEndpoint('finance-coupons-all'),
    { query: isActive !== undefined ? { isActive: isActive.toString() } : undefined },
    { enabled: true }
  );
}

// ==================== Reconciliations Hooks ====================

export function useReconciliations(status?: string) {
  return useAdminQuery<Types.FinanceResponse<Types.Reconciliation[]>>(
    getEndpoint('finance-reconciliations-all'),
    { query: status ? { status } : undefined },
    { enabled: true }
  );
}

export function useReconciliation(id: string) {
  return useAdminQuery<Types.FinanceResponse<Types.Reconciliation>>(
    getEndpoint('finance-reconciliation-get'),
    { params: { id } },
    { enabled: !!id }
  );
}

// ==================== Reports Hooks ====================

export function useDailyReport(date: string) {
  return useAdminQuery<Types.FinanceResponse<Types.DailyReport>>(
    getEndpoint('finance-report-daily-get'),
    { params: { date } },
    { enabled: !!date }
  );
}

export function useFinancialReports(query: Types.DateRangeQuery) {
  const queryParams: Record<string, string> = {
    ...(query.startDate && { startDate: query.startDate }),
    ...(query.endDate && { endDate: query.endDate }),
  };
  return useAdminQuery<Types.FinanceResponse<Types.DailyReport[]>>(
    getEndpoint('finance-reports-get'),
    { query: queryParams },
    { enabled: !!query.startDate && !!query.endDate }
  );
}

// ==================== Mutations API ====================

export function useFinanceAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    // Commissions
    createCommission: async (data: Types.CreateCommissionDto) => {
      return callEndpoint(getEndpoint('finance-commission-create'), { body: data });
    },

    approveCommission: async (id: string) => {
      return callEndpoint(getEndpoint('finance-commission-approve'), { params: { id } });
    },

    cancelCommission: async (id: string) => {
      return callEndpoint(getEndpoint('finance-commission-cancel'), { params: { id } });
    },

    // Payout Batches
    createPayoutBatch: async (commissionIds: string[], batch: Types.CreatePayoutBatchDto) => {
      return callEndpoint(getEndpoint('finance-payout-batch-create'), {
        body: { commissionIds, batch }
      });
    },

    approvePayoutBatch: async (id: string, dto: Types.ApprovePayoutBatchDto) => {
      return callEndpoint(getEndpoint('finance-payout-batch-approve'), {
        params: { id },
        body: dto
      });
    },

    completePayoutBatch: async (id: string, transactionIds: Record<string, string>) => {
      return callEndpoint(getEndpoint('finance-payout-batch-complete'), {
        params: { id },
        body: { transactionIds }
      });
    },

    // Settlements
    createSettlement: async (data: Types.CreateSettlementDto) => {
      return callEndpoint(getEndpoint('finance-settlement-create'), { body: data });
    },

    approveSettlement: async (id: string, dto: Types.ApproveSettlementDto) => {
      return callEndpoint(getEndpoint('finance-settlement-approve'), {
        params: { id },
        body: dto
      });
    },

    // Coupons
    createCoupon: async (data: Types.CreateFinancialCouponDto) => {
      return callEndpoint(getEndpoint('finance-coupon-create'), { body: data });
    },

    updateCoupon: async (id: string, data: Types.UpdateFinancialCouponDto) => {
      return callEndpoint(getEndpoint('finance-coupon-update'), {
        params: { id },
        body: data
      });
    },

    // Reconciliations
    createReconciliation: async (data: Types.CreateReconciliationDto) => {
      return callEndpoint(getEndpoint('finance-reconciliation-create'), { body: data });
    },

    addActualTotals: async (id: string, totals: {
      totalDeposits: number;
      totalWithdrawals: number;
      totalFees: number;
    }) => {
      return callEndpoint(getEndpoint('finance-reconciliation-add-actuals'), {
        params: { id },
        body: totals
      });
    },

    addReconciliationIssue: async (id: string, issue: {
      type: 'missing_transaction' | 'amount_mismatch' | 'duplicate' | 'other';
      description: string;
      expectedAmount?: number;
      actualAmount?: number;
      transactionRef?: string;
    }) => {
      return callEndpoint(getEndpoint('finance-reconciliation-add-issue'), {
        params: { id },
        body: issue
      });
    },

    resolveReconciliationIssue: async (id: string, issueIndex: number, resolution: string) => {
      return callEndpoint(getEndpoint('finance-reconciliation-resolve-issue'), {
        params: { id, issueIndex: issueIndex.toString() },
        body: { resolution }
      });
    },

    // Reports
    generateDailyReport: async (date: string) => {
      return callEndpoint(getEndpoint('finance-report-daily-generate'), { body: { date } });
    },

    finalizeReport: async (id: string) => {
      return callEndpoint(getEndpoint('finance-report-finalize'), { params: { id } });
    },
  };
}

