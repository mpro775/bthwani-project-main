import axiosInstance from "../utils/axios";

export interface SystemOverview {
  totalUsers: number;
  totalVendors: number;
  totalDrivers: number;
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingSettlements: number;
  completedSettlements: number;
  walletBalance: number;
  periodComparison: {
    currentPeriod: number;
    previousPeriod: number;
    growth: number;
  };
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  topStores: {
    storeId: string;
    storeName: string;
    orderCount: number;
    revenue: number;
  }[];
  dailyOrders: {
    date: string;
    count: number;
    revenue: number;
  }[];
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  userRetention: number;
  topUsersByOrders: {
    userId: string;
    userName: string;
    orderCount: number;
    totalSpent: number;
  }[];
  userRegistrationTrend: {
    date: string;
    count: number;
  }[];
}

export interface VendorAnalytics {
  totalVendors: number;
  activeVendors: number;
  newVendors: number;
  topPerformingVendors: {
    vendorId: string;
    vendorName: string;
    storeName: string;
    totalSales: number;
    orderCount: number;
    rating: number;
  }[];
  vendorGrowth: number;
  averageVendorRating: number;
}

export interface DriverAnalytics {
  totalDrivers: number;
  activeDrivers: number;
  busyDrivers: number;
  completedDeliveries: number;
  averageDeliveryTime: number;
  topDrivers: {
    driverId: string;
    driverName: string;
    deliveries: number;
    rating: number;
  }[];
}

export interface ReportFilter {
  dateRange: {
    from: string;
    to: string;
  };
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  storeId?: string;
  vendorId?: string;
  userId?: string;
  category?: string;
}

// Get system overview dashboard
export async function getSystemOverview(filters?: ReportFilter): Promise<SystemOverview> {
  const { data } = await axiosInstance.get<SystemOverview>("/admin/reports/overview", {
    params: filters,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get financial summary
export async function getFinancialSummary(filters?: ReportFilter): Promise<FinancialSummary> {
  const { data } = await axiosInstance.get<FinancialSummary>("/admin/reports/financial", {
    params: filters,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get order analytics
export async function getOrderAnalytics(filters?: ReportFilter): Promise<OrderAnalytics> {
  const { data } = await axiosInstance.get<OrderAnalytics>("/admin/reports/orders", {
    params: filters,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get user analytics
export async function getUserAnalytics(filters?: ReportFilter): Promise<UserAnalytics> {
  const { data } = await axiosInstance.get<UserAnalytics>("/admin/reports/users", {
    params: filters,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get vendor analytics
export async function getVendorAnalytics(filters?: ReportFilter): Promise<VendorAnalytics> {
  const { data } = await axiosInstance.get<VendorAnalytics>("/admin/reports/vendors", {
    params: filters,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver analytics
export async function getDriverAnalytics(filters?: ReportFilter): Promise<DriverAnalytics> {
  const { data } = await axiosInstance.get<DriverAnalytics>("/admin/reports/drivers", {
    params: filters,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Generate comprehensive report
export async function generateComprehensiveReport(filters?: ReportFilter): Promise<{
  systemOverview: SystemOverview;
  financialSummary: FinancialSummary;
  orderAnalytics: OrderAnalytics;
  userAnalytics: UserAnalytics;
  vendorAnalytics: VendorAnalytics;
  driverAnalytics: DriverAnalytics;
}> {
  const { data } = await axiosInstance.post("/admin/reports/generate", filters, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Export report to Excel/PDF
export async function exportReport(
  type: 'overview' | 'financial' | 'orders' | 'users' | 'vendors' | 'drivers' | 'comprehensive',
  format: 'excel' | 'pdf',
  filters?: ReportFilter
): Promise<Blob> {
  const { data } = await axiosInstance.post(`/admin/reports/export/${type}/${format}`, filters, {
    responseType: 'blob',
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get real-time metrics for dashboard
export async function getRealtimeMetrics(): Promise<{
  activeUsers: number;
  currentOrders: number;
  revenueToday: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}> {
  const { data } = await axiosInstance.get("/admin/reports/realtime", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}
