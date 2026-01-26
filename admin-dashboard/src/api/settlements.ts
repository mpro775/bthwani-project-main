import axiosInstance from "../utils/axios";

export interface SettlementRequest {
  _id?: string;
  vendor: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  store: {
    _id: string;
    name: string;
    address: string;
  };
  amount: number;
  status: "pending" | "completed" | "rejected";
  requestedAt: string;
  processedAt?: string;
  bankAccount?: string;
}

export interface SettlementStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
}

// Get all settlement requests with pagination and filters
export async function getSettlementRequests(params?: {
  status?: string;
  vendorId?: string;
  storeId?: string;
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<{
  settlementRequests: SettlementRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const { data } = await axiosInstance.get<{
    settlementRequests: SettlementRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>("/admin/wallet/settlements", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get settlement request by ID
export async function getSettlementRequest(id: string): Promise<SettlementRequest> {
  const { data } = await axiosInstance.get<SettlementRequest>(`/admin/wallet/settlements/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Update settlement status
export async function updateSettlementStatus(
  id: string,
  status: "pending" | "completed" | "rejected",
  processedAt?: string
): Promise<SettlementRequest> {
  const { data } = await axiosInstance.patch<SettlementRequest>(`/admin/wallet/settlements/${id}/status`, {
    status,
    processedAt
  });
  return data;
}

// Get settlement statistics
export async function getSettlementStats(params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<SettlementStats> {
  const { data } = await axiosInstance.get<SettlementStats>("/admin/wallet/settlements/stats", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Export settlements to Excel/CSV
export async function exportSettlements(params?: {
  status?: string;
  fromDate?: string;
  toDate?: string;
  format?: 'excel' | 'csv';
}): Promise<Blob> {
  const { data } = await axiosInstance.get("/admin/wallet/settlements/export", {
    params,
    responseType: 'blob',
    headers: { "x-silent-401": "1" }
  });
  return data;
}
