import axiosInstance from "../utils/axios";

export interface WalletTransaction {
  _id?: string;
  userId: string;
  userModel: "User" | "Driver";
  amount: number;
  type: "credit" | "debit";
  method: "agent" | "card" | "transfer" | "payment" | "escrow" | "reward" | "kuraimi" | "withdrawal";
  status: "pending" | "completed" | "failed" | "reversed";
  description?: string;
  bankRef?: string;
  meta?: any;
  createdAt?: string;
}

export interface Wallet {
  balance: number;
  onHold: number;
  available: number;
  loyaltyPoints: number;
  transactions: WalletTransaction[];
}

export interface WalletUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  wallet: Wallet;
}

export interface Coupon {
  _id?: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDate: string;
  isUsed: boolean;
  assignedTo?: string;
  usageLimit?: number;
  usedCount: number;
  createdAt?: string;
}

export interface Subscription {
  _id?: string;
  user: string;
  plan: string;
  amount: number;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt?: string;
}

// Get all wallet transactions
export async function getWalletTransactions(params?: {
  userId?: string;
  type?: string;
  status?: string;
  method?: string;
  cursor?: string;
  limit?: number;
}): Promise<{
  data: WalletTransaction[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  // Note: Backend uses /v2/wallet/transactions (not /admin/wallet/transactions)
  // Admin access is controlled by JWT + Roles decorator
  const { data } = await axiosInstance.get<{
    data: WalletTransaction[];
    hasMore: boolean;
    nextCursor?: string;
  }>("/v2/wallet/transactions", {
    params: {
      cursor: params?.cursor,
      limit: params?.limit || 20,
    },
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get wallet balance for user (Admin uses same endpoint with JWT auth)
export async function getUserWallet(userId: string): Promise<Wallet> {
  // Note: This requires the admin to impersonate or have special access
  // Current backend doesn't support getting other user's wallet directly
  // May need to add admin-specific endpoint in backend
  const { data } = await axiosInstance.get<Wallet>(`/v2/wallet/balance`, {
    headers: { "x-silent-401": "1" },
    params: { userId } // If backend supports it
  });
  return data;
}

// Get all users with wallets (Admin)
export async function getWalletUsers(params?: {
  search?: string;
  minBalance?: number;
  maxBalance?: number;
  minOnHold?: number;
  maxOnHold?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{
  data: WalletUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const { data } = await axiosInstance.get<{
    data: WalletUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>("/wallet/admin/users", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Update wallet balance via credit/debit (Admin) – uses createTransaction
export async function updateWalletBalance(
  userId: string,
  amount: number,
  type: "credit" | "debit",
  description: string
): Promise<WalletTransaction> {
  return createTransaction({
    userId,
    amount,
    type,
    method: "agent",
    description,
  });
}

// Create transaction (Admin only - exists in backend)
export async function createTransaction(data: {
  userId: string;
  amount: number;
  type: "credit" | "debit";
  method: string;
  description?: string;
}): Promise<WalletTransaction> {
  const { data: response } = await axiosInstance.post<WalletTransaction>(
    "/v2/wallet/transaction",
    data
  );
  return response;
}

// Hold funds (Admin only - exists in backend)
export async function holdFunds(data: {
  userId: string;
  amount: number;
  orderId?: string;
}): Promise<{ success: boolean; message: string }> {
  const { data: response } = await axiosInstance.post(
    "/v2/wallet/hold",
    data
  );
  return response;
}

// Release funds (Admin only - exists in backend)
export async function releaseFunds(data: {
  userId: string;
  amount: number;
  orderId?: string;
}): Promise<{ success: boolean; message: string }> {
  const { data: response } = await axiosInstance.post(
    "/v2/wallet/release",
    data
  );
  return response;
}

// Refund funds (Admin only - exists in backend)
export async function refundFunds(data: {
  userId: string;
  amount: number;
  orderId?: string;
  reason?: string;
}): Promise<{ success: boolean; message: string }> {
  const { data: response } = await axiosInstance.post(
    "/v2/wallet/refund",
    data
  );
  return response;
}

// Get wallet statistics (Admin)
export async function getWalletStats(period?: 'today' | 'week' | 'month' | 'year' | 'all'): Promise<{
  totalUsers: number;
  usersWithWallet: number;
  totalBalance: number;
  totalOnHold: number;
  totalAvailable: number;
  totalTransactions: number;
  transactionsToday: number;
  transactionsInPeriod: number;
  creditsInPeriod: number;
  debitsInPeriod: number;
  netInPeriod: number;
  averageBalance: number;
  period: string;
}> {
  const { data } = await axiosInstance.get<{
    totalUsers: number;
    usersWithWallet: number;
    totalBalance: number;
    totalOnHold: number;
    totalAvailable: number;
    totalTransactions: number;
    transactionsToday: number;
    transactionsInPeriod: number;
    creditsInPeriod: number;
    debitsInPeriod: number;
    netInPeriod: number;
    averageBalance: number;
    period: string;
  }>("/wallet/admin/stats", {
    params: period ? { period } : {},
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get all transactions with filters (Admin)
export async function getAllTransactions(params?: {
  userId?: string;
  userModel?: string;
  type?: string;
  method?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  orderId?: string;
  refType?: string;
  cursor?: string;
  limit?: number;
}): Promise<{
  data: WalletTransaction[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}> {
  const { data } = await axiosInstance.get<{
    data: WalletTransaction[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
      limit: number;
    };
  }>("/wallet/admin/transactions", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get user wallet for admin
export async function getUserWalletForAdmin(userId: string): Promise<{
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
    createdAt: string;
    updatedAt: string;
  };
  wallet: Wallet;
  recentTransactions: WalletTransaction[];
}> {
  const { data } = await axiosInstance.get<{
    user: {
      _id: string;
      fullName: string;
      email: string;
      phone: string;
      profileImage: string;
      createdAt: string;
      updatedAt: string;
    };
    wallet: Wallet;
    recentTransactions: WalletTransaction[];
  }>(`/wallet/admin/user/${userId}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// ==================== Withdrawal Management (Admin) ====================

export interface WithdrawalRequest {
  _id: string;
  userId: string;
  userModel: "User" | "Driver";
  amount: number;
  method: string;
  accountInfo: any;
  status: "pending" | "approved" | "rejected" | "cancelled";
  transactionRef?: string;
  notes?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// Get all withdrawal requests (Admin)
export async function getAllWithdrawals(params?: {
  status?: string;
  userModel?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { data } = await axiosInstance.get<{
    data: WithdrawalRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>("/wallet/admin/withdrawals", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get pending withdrawal requests (Admin)
export async function getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  const { data } = await axiosInstance.get<WithdrawalRequest[]>(
    "/wallet/admin/withdrawals/pending",
    {
      headers: { "x-silent-401": "1" }
    }
  );
  return data;
}

// Approve withdrawal request (Admin)
export async function approveWithdrawal(
  withdrawalId: string,
  data: {
    transactionRef?: string;
    notes?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const { data: response } = await axiosInstance.patch<{
    success: boolean;
    message: string;
  }>(`/wallet/admin/withdrawals/${withdrawalId}/approve`, data);
  return response;
}

// Reject withdrawal request (Admin)
export async function rejectWithdrawal(
  withdrawalId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const { data: response } = await axiosInstance.patch<{
    success: boolean;
    message: string;
  }>(`/wallet/admin/withdrawals/${withdrawalId}/reject`, { reason });
  return response;
}
