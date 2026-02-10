import axios from "./axios";

/**
 * Wallet API for Drivers
 * جميع endpoints المتعلقة بمحفظة السائق
 */

export interface WalletBalance {
  balance: number;
  onHold: number;
  available: number;
  totalSpent: number;
  totalEarned: number;
  loyaltyPoints: number;
  currency: string;
  lastUpdated: string;
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
  meta?: any;
}

export interface WithdrawMethod {
  id: string;
  name: string;
  type: "bank_transfer" | "agent";
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  processingTime?: string;
}

export interface WithdrawalRequest {
  _id: string;
  amount: number;
  method: string;
  accountInfo: any;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// ==================== Balance ====================

/**
 * جلب رصيد المحفظة
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await axios.get("/wallet/balance");
  return response.data;
};

// ==================== Transactions ====================

/**
 * جلب سجل المعاملات
 */
export const getTransactions = async (params?: {
  cursor?: string;
  limit?: number;
  type?: string;
  status?: string;
  method?: string;
}): Promise<{ data: Transaction[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axios.get("/wallet/transactions", {
    params,
  });
  return response.data;
};

/**
 * جلب تفاصيل معاملة محددة
 */
export const getTransactionDetails = async (
  transactionId: string
): Promise<{ transaction: Transaction }> => {
  const response = await axios.get(`/wallet/transaction/${transactionId}`);
  return response.data;
};

// ==================== Withdrawals ====================

/**
 * الحصول على طرق السحب المتاحة
 */
export const getWithdrawMethods = async (): Promise<WithdrawMethod[]> => {
  const response = await axios.get("/wallet/withdraw/methods");
  return response.data.methods || response.data;
};

/**
 * طلب سحب من المحفظة
 */
export const requestWithdrawal = async (data: {
  amount: number;
  method: string;
  accountInfo: Record<string, unknown>;
}): Promise<{ success: boolean; withdrawalId: string; message: string }> => {
  const response = await axios.post("/wallet/withdraw/request", data);
  return response.data;
};

/**
 * طلبات السحب الخاصة بي
 */
export const getMyWithdrawals = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<{ data: WithdrawalRequest[]; hasMore: boolean; nextCursor?: string }> => {
  const response = await axios.get("/wallet/withdraw/my", { params });
  return response.data;
};

/**
 * إلغاء طلب سحب
 */
export const cancelWithdrawal = async (
  withdrawalId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.patch(
    `/wallet/withdraw/${withdrawalId}/cancel`
  );
  return response.data;
};
