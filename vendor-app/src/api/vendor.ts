import axiosInstance from "./axiosInstance";
import { unwrapResponse } from "../utils/apiHelpers";

export interface VendorProfile {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  store: {
    _id: string;
    name_ar?: string;
    name_en?: string;
    isActive: boolean;
  };
  isActive: boolean;
  salesCount: number;
  totalRevenue: number;
  notificationSettings?: {
    enabled: boolean;
    orderAlerts: boolean;
    financialAlerts: boolean;
    marketingAlerts: boolean;
    systemUpdates: boolean;
  };
  createdAt: string;
}

export interface UpdateVendorDto {
  expoPushToken?: string;
  notificationSettings?: {
    enabled?: boolean;
    orderAlerts?: boolean;
    financialAlerts?: boolean;
    marketingAlerts?: boolean;
    systemUpdates?: boolean;
  };
}

// Get vendor profile
export const getProfile = async () => {
  const res = await axiosInstance.get("/vendors/me");
  return unwrapResponse<VendorProfile>(res);
};

// Update vendor profile
export const updateProfile = async (updates: UpdateVendorDto) => {
  const res = await axiosInstance.patch("/vendors/me", updates);
  return unwrapResponse<VendorProfile>(res);
};

// Update push token
export const updatePushToken = async (token: string) => {
  const res = await axiosInstance.patch("/vendors/me", {
    expoPushToken: token,
  });
  return unwrapResponse<any>(res);
};

// Dashboard overview
export interface VendorDashboard {
  sales?: { day?: { totalSales: number }; week?: { totalSales: number }; month?: { totalSales: number } };
  status?: { delivered?: number; preparing?: number; cancelled?: number; all?: number };
  timeline?: { _id: string; count: number }[];
  avgRating?: number;
  topProducts?: any[];
  lowestProducts?: any[];
  [key: string]: any;
}

export const getDashboard = async () => {
  const res = await axiosInstance.get("/vendors/dashboard/overview");
  return unwrapResponse<VendorDashboard>(res);
};

// Account statement
export interface VendorAccountStatement {
  currentBalance: number;
  totalEarnings?: number;
  totalWithdrawals?: number;
  pendingAmount?: number;
  transactions?: any[];
}

export const getAccountStatement = async () => {
  const res = await axiosInstance.get("/vendors/account/statement");
  return unwrapResponse<VendorAccountStatement>(res);
};

// Settlements
export interface SettlementRequest {
  _id?: string;
  id?: string;
  amount: number;
  status: string;
  requestedDate?: string;
  processedDate?: string;
  bankAccount?: string;
}

export const getSettlements = async () => {
  const res = await axiosInstance.get("/vendors/settlements");
  const data = unwrapResponse<SettlementRequest[]>(res);
  return Array.isArray(data) ? data : [];
};

export const createSettlement = async (body: { amount: number; bankAccount?: string }) => {
  const res = await axiosInstance.post("/vendors/settlements", body);
  return unwrapResponse<SettlementRequest>(res);
};

// Sales
export interface SaleRecord {
  id?: string;
  orderId?: string;
  amount?: number;
  date?: string;
  customerCode?: string;
  commission?: number;
  netAmount?: number;
}

export const getSales = async (limit = 100) => {
  const res = await axiosInstance.get("/vendors/sales", { params: { limit } });
  const data = unwrapResponse<SaleRecord[]>(res);
  return Array.isArray(data) ? data : [];
};

// Account deletion request
export const requestAccountDeletion = async (body: { reason?: string; exportData?: boolean }) => {
  const res = await axiosInstance.post("/vendors/account/delete-request", body);
  return unwrapResponse<any>(res);
};

