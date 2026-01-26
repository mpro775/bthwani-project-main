import axiosInstance from "../utils/axios";

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  storeName: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  customerSatisfaction: number;
  period: {
    from: string;
    to: string;
  };
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topPerformingVendors: VendorPerformance[];
  recentActivity: {
    newVendors: number;
    salesGrowth: number;
    orderGrowth: number;
  };
}

export interface VendorDetails {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  store: {
    _id: string;
    name: string;
    address: string;
    category: string;
  };
  isActive: boolean;
  salesCount: number;
  totalRevenue: number;
  createdAt: string;
  lastOrderDate?: string;
  averageRating?: number;
  totalCustomers?: number;
}

// Get vendor by ID
export async function getVendor(id: string): Promise<VendorDetails> {
  const { data } = await axiosInstance.get<VendorDetails>(`/vendors/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get all vendors with optional filters
export async function getVendors(params?: {
  isActive?: boolean;
  storeId?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}): Promise<{
  data: VendorDetails[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}> {
  const queryParams: any = { limit: params?.limit || 20 };
  if (params?.cursor) queryParams.cursor = params.cursor;
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive;
  
  const { data } = await axiosInstance.get("/vendors", {
    params: queryParams,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new vendor
export async function createVendor(vendorData: {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  store: string;
}): Promise<VendorDetails> {
  const { data } = await axiosInstance.post<VendorDetails>("/vendors", vendorData);
  return data;
}

// Get vendor stats (overview) – tries /vendors/dashboard/overview, falls back to aggregating getVendors
export async function getVendorStats(): Promise<VendorStats> {
  try {
    const { data } = await axiosInstance.get<VendorStats>("/vendors/dashboard/overview", {
      headers: { "x-silent-401": "1" },
    });
    return data;
  } catch {
    const { data } = await getVendors({ limit: 500 });
    const active = data.filter((v) => v.isActive).length;
    const totalSales = data.reduce((s, v) => s + (v.totalRevenue ?? 0), 0);
    const totalOrders = data.reduce((s, v) => s + (v.salesCount ?? 0), 0);
    return {
      totalVendors: data.length,
      activeVendors: active,
      inactiveVendors: data.length - active,
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders ? totalSales / totalOrders : 0,
      topPerformingVendors: data
        .slice()
        .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
        .slice(0, 10)
        .map((v) => ({
          vendorId: v._id,
          vendorName: v.fullName,
          storeName: v.store?.name ?? "",
          totalSales: v.totalRevenue ?? 0,
          totalOrders: v.salesCount ?? 0,
          averageOrderValue: v.salesCount ? (v.totalRevenue ?? 0) / v.salesCount : 0,
          conversionRate: 0,
          customerSatisfaction: v.averageRating ?? 0,
          period: { from: "", to: "" },
        })),
      recentActivity: { newVendors: 0, salesGrowth: 0, orderGrowth: 0 },
    };
  }
}

// Get performance for a single vendor – tries /vendors/:id/performance
export async function getVendorPerformance(
  vendorId: string,
  opts?: { period?: "week" | "month" | "quarter" | "year" }
): Promise<VendorPerformance | null> {
  try {
    const { data } = await axiosInstance.get<VendorPerformance>(
      `/vendors/${vendorId}/performance`,
      { params: opts, headers: { "x-silent-401": "1" } }
    );
    return data;
  } catch {
    const v = await getVendor(vendorId).catch(() => null);
    if (!v) return null;
    return {
      vendorId: v._id,
      vendorName: v.fullName,
      storeName: v.store?.name ?? "",
      totalSales: v.totalRevenue ?? 0,
      totalOrders: v.salesCount ?? 0,
      averageOrderValue: v.salesCount ? (v.totalRevenue ?? 0) / v.salesCount : 0,
      conversionRate: 0,
      customerSatisfaction: v.averageRating ?? 0,
      period: { from: "", to: "" },
    };
  }
}

// Get sales chart data for a vendor – tries /vendors/:id/sales
export async function getVendorSalesData(
  vendorId: string,
  opts?: { period?: "week" | "month" | "quarter" }
): Promise<{ labels: string[]; sales: number[]; orders: number[] }> {
  try {
    const { data } = await axiosInstance.get<{
      labels: string[];
      sales: number[];
      orders: number[];
    }>(`/vendors/${vendorId}/sales`, {
      params: opts,
      headers: { "x-silent-401": "1" },
    });
    return data;
  } catch {
    return { labels: [], sales: [], orders: [] };
  }
}

// Update vendor status
export async function updateVendorStatus(vendorId: string, isActive: boolean): Promise<VendorDetails> {
  const { data } = await axiosInstance.patch<VendorDetails>(`/vendors/${vendorId}/status`, {
    isActive
  });
  return data;
}

// Update vendor information
export async function updateVendor(vendorId: string, updates: Partial<VendorDetails>): Promise<VendorDetails> {
  const { data } = await axiosInstance.patch<VendorDetails>(`/vendors/${vendorId}`, updates);
  return data;
}

// Reset vendor password
export async function resetVendorPassword(vendorId: string, newPassword: string): Promise<void> {
  await axiosInstance.post(`/vendors/${vendorId}/reset-password`, {
    password: newPassword
  });
}

// Note: Delete & Export endpoints غير موجودة في Backend
// يمكن إضافتها في vendor.controller.ts أو admin.controller.ts عند الحاجة
