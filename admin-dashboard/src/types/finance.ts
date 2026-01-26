/**
 * Finance System Types
 * أنواع النظام المالي
 */

// ==================== Commission Types ====================

export interface Commission {
  id: string;
  type: 'driver' | 'marketer' | 'vendor';
  beneficiaryId: string;
  amount: number;
  orderId?: string;
  applicationId?: string;
  status: 'pending' | 'approved' | 'cancelled' | 'paid';
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface CreateCommissionDto {
  type: 'driver' | 'marketer' | 'vendor';
  beneficiaryId: string;
  amount: number;
  orderId?: string;
  applicationId?: string;
}

export interface CommissionStats {
  totalCommissions: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  cancelledAmount: number;
}

// ==================== Payout Batch Types ====================

export interface PayoutBatch {
  id: string;
  batchNumber: string;
  totalAmount: number;
  itemsCount: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface PayoutBatchItem {
  id: string;
  batchId: string;
  commissionId: string;
  beneficiaryId: string;
  beneficiaryType: 'driver' | 'marketer' | 'vendor';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  failureReason?: string;
}

export interface CreatePayoutBatchDto {
  description?: string;
}

export interface ApprovePayoutBatchDto {
  notes?: string;
}

// ==================== Settlement Types ====================

export interface Settlement {
  id: string;
  entityId: string;
  entityModel: 'Driver' | 'Vendor';
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  grossRevenue: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  transactionRef?: string;
  createdAt: string;
}

export interface CreateSettlementDto {
  entityId: string;
  entityModel: 'Driver' | 'Vendor';
  periodStart: string;
  periodEnd: string;
}

export interface ApproveSettlementDto {
  notes?: string;
}

// ==================== Coupon Types ====================

export interface FinancialCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreateFinancialCouponDto {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface UpdateFinancialCouponDto {
  isActive?: boolean;
  usageLimit?: number;
  validUntil?: string;
}

export interface ValidateCouponDto {
  code: string;
  orderAmount: number;
}

// ==================== Reconciliation Types ====================

export interface Reconciliation {
  id: string;
  periodStart: string;
  periodEnd: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  expectedTotals: {
    deposits: number;
    withdrawals: number;
    fees: number;
  };
  actualTotals?: {
    deposits: number;
    withdrawals: number;
    fees: number;
  };
  discrepancies?: {
    deposits: number;
    withdrawals: number;
    fees: number;
  };
  issues: Array<{
    type: 'missing_transaction' | 'amount_mismatch' | 'duplicate' | 'other';
    description: string;
    expectedAmount?: number;
    actualAmount?: number;
    transactionRef?: string;
    resolved: boolean;
    resolvedBy?: string;
    resolution?: string;
  }>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
}

export interface CreateReconciliationDto {
  startDate: string;
  endDate: string;
  periodType: 'daily' | 'weekly' | 'monthly';
}

// ==================== Financial Report Types ====================

export interface DailyReport {
  id: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  vendorRevenue: number;
  driverRevenue: number;
  totalCommissions: number;
  totalTax: number;
  status: 'draft' | 'finalized';
  createdAt: string;
  finalizedAt?: string;
}

export interface FinancialReportSummary {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
  averageOrderValue: number;
}

// ==================== Response Types ====================

export interface FinanceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedFinanceResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Query Types ====================

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface StatusQuery {
  status?: string;
}

