import axiosInstance from "../utils/api/axiosInstance";

/**
 * Wallet API - محفظة المستخدم
 * جميع endpoints المتعلقة بالمحفظة والمعاملات المالية
 */

export interface WalletBalance {
  balance: number;
  onHold: number;
  available: number;
  loyaltyPoints: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  method: string;
  status: "pending" | "completed" | "failed" | "reversed";
  description?: string;
  createdAt: string;
}

export interface TopupMethod {
  id: string;
  name: string;
  type: "kuraimi" | "card" | "agent";
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
}

export interface WithdrawMethod {
  id: string;
  name: string;
  type: "bank_transfer" | "agent";
  enabled: boolean;
  minAmount: number;
  processingTime: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDate: string;
  isUsed: boolean;
  usedCount: number;
  usageLimit?: number;
}

export interface Subscription {
  _id: string;
  plan: string;
  amount: number;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Bill {
  _id: string;
  billType: "electricity" | "water" | "internet";
  billNumber: string;
  amount: number;
  status: "paid" | "pending";
  paidAt?: string;
  createdAt: string;
}

// ==================== Balance ====================

/**
 * جلب رصيد المحفظة
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await axiosInstance.get("/v2/wallet/balance");
  return response.data;
};

// ==================== Transactions ====================

/**
 * جلب سجل المعاملات
 */
export const getTransactions = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: Transaction[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axiosInstance.get("/v2/wallet/transactions", {
    params,
  });
  return response.data;
};

/**
 * جلب تفاصيل معاملة محددة
 */
export const getTransactionDetails = async (
  transactionId: string
): Promise<Transaction> => {
  const response = await axiosInstance.get(
    `/v2/wallet/transaction/${transactionId}`
  );
  return response.data;
};

// ==================== Topup ====================

/**
 * الحصول على طرق الشحن المتاحة
 */
export const getTopupMethods = async (): Promise<TopupMethod[]> => {
  const response = await axiosInstance.get("/v2/wallet/topup/methods");
  return response.data;
};

/**
 * شحن المحفظة عبر كريمي
 */
export const topupViaKuraimi = async (data: {
  amount: number;
  SCustID: string;
  PINPASS: string;
}): Promise<{ success: boolean; transactionId: string; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/topup/kuraimi", data);
  return response.data;
};

/**
 * التحقق من عملية الشحن
 */
export const verifyTopup = async (
  transactionId: string
): Promise<{ success: boolean; transaction: Transaction }> => {
  const response = await axiosInstance.post("/v2/wallet/topup/verify", {
    transactionId,
  });
  return response.data;
};

/**
 * سجل عمليات الشحن
 */
export const getTopupHistory = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: Transaction[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axiosInstance.get("/v2/wallet/topup/history", {
    params,
  });
  return response.data;
};

// ==================== Withdrawals ====================

/**
 * الحصول على طرق السحب المتاحة
 */
export const getWithdrawMethods = async (): Promise<WithdrawMethod[]> => {
  const response = await axiosInstance.get("/v2/wallet/withdraw/methods");
  return response.data;
};

/**
 * طلب سحب من المحفظة
 */
export const requestWithdrawal = async (data: {
  amount: number;
  method: string;
  accountInfo: Record<string, unknown>;
}): Promise<{ success: boolean; withdrawalId: string; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/withdraw/request", data);
  return response.data;
};

/**
 * طلبات السحب الخاصة بي
 */
export const getMyWithdrawals = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: any[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axiosInstance.get("/v2/wallet/withdraw/my", { params });
  return response.data;
};

/**
 * إلغاء طلب سحب
 */
export const cancelWithdrawal = async (
  withdrawalId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.patch(
    `/v2/wallet/withdraw/${withdrawalId}/cancel`
  );
  return response.data;
};

// ==================== Coupons ====================

/**
 * تطبيق كوبون خصم
 */
export const applyCoupon = async (data: {
  code: string;
  amount?: number;
}): Promise<{ success: boolean; discount: number; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/coupons/apply", data);
  return response.data;
};

/**
 * التحقق من صلاحية كوبون
 */
export const validateCoupon = async (
  code: string
): Promise<{ valid: boolean; coupon?: Coupon; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/coupons/validate", {
    code,
  });
  return response.data;
};

/**
 * كوبوناتي
 */
export const getMyCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get("/v2/wallet/coupons/my");
  return response.data;
};

/**
 * سجل استخدام الكوبونات
 */
export const getCouponHistory = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: Coupon[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axiosInstance.get("/v2/wallet/coupons/history", {
    params,
  });
  return response.data;
};

// ==================== Subscriptions ====================

/**
 * الاشتراك في خدمة
 */
export const subscribe = async (data: {
  planId: string;
  autoRenew?: boolean;
}): Promise<{ success: boolean; subscription: Subscription; message: string }> => {
  const response = await axiosInstance.post(
    "/v2/wallet/subscriptions/subscribe",
    data
  );
  return response.data;
};

/**
 * اشتراكاتي
 */
export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const response = await axiosInstance.get("/v2/wallet/subscriptions/my");
  return response.data;
};

/**
 * إلغاء اشتراك
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.patch(
    `/v2/wallet/subscriptions/${subscriptionId}/cancel`
  );
  return response.data;
};

// ==================== Pay Bills ====================

/**
 * دفع فاتورة
 */
export const payBill = async (data: {
  billType: "electricity" | "water" | "internet";
  billNumber: string;
  amount: number;
}): Promise<{ success: boolean; bill: Bill; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/pay-bill", data);
  return response.data;
};

/**
 * سجل الفواتير المدفوعة
 */
export const getBills = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: Bill[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axiosInstance.get("/v2/wallet/bills", { params });
  return response.data;
};

// ==================== Transfers ====================

/**
 * تحويل رصيد
 */
export const transferFunds = async (data: {
  recipientPhone: string;
  amount: number;
  notes?: string;
}): Promise<{ success: boolean; transaction: Transaction; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/transfer", data);
  return response.data;
};

/**
 * سجل التحويلات
 */
export const getTransfers = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: Transaction[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axiosInstance.get("/v2/wallet/transfers", { params });
  return response.data;
};

// ==================== Refunds ====================

/**
 * طلب استرجاع
 */
export const requestRefund = async (data: {
  transactionId: string;
  reason: string;
}): Promise<{ success: boolean; refundId: string; message: string }> => {
  const response = await axiosInstance.post("/v2/wallet/refund/request", data);
  return response.data;
};

// ==================== Exports ====================

export default {
  // Balance
  getWalletBalance,

  // Transactions
  getTransactions,
  getTransactionDetails,

  // Topup
  getTopupMethods,
  topupViaKuraimi,
  verifyTopup,
  getTopupHistory,

  // Withdrawals
  getWithdrawMethods,
  requestWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal,

  // Coupons
  applyCoupon,
  validateCoupon,
  getMyCoupons,
  getCouponHistory,

  // Subscriptions
  subscribe,
  getMySubscriptions,
  cancelSubscription,

  // Bills
  payBill,
  getBills,

  // Transfers
  transferFunds,
  getTransfers,

  // Refunds
  requestRefund,
};

