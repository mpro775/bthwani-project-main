/**
 * Analytics Types
 * جميع الأنواع الخاصة بالتحليلات والإحصائيات
 */

// ==================== ROAS Types ====================

export interface DailyRoas {
  date: string;
  platform: string;
  adSpend: number;
  revenue: number;
  roas: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

export interface RoasSummary {
  totalAdSpend: number;
  totalRevenue: number;
  averageRoas: number;
  bestDay: {
    date: string;
    roas: number;
  };
  worstDay: {
    date: string;
    roas: number;
  };
}

export interface RoasByPlatform {
  platform: string;
  adSpend: number;
  revenue: number;
  roas: number;
  campaigns: number;
}

// ==================== Ad Spend Types ====================

export interface AdSpend {
  id: string;
  date: string;
  platform: string;
  campaignName: string;
  amount: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  createdAt: string;
}

export interface AdSpendSummary {
  totalSpend: number;
  platforms: Record<string, number>;
  topCampaigns: Array<{
    name: string;
    platform: string;
    spend: number;
    roas: number;
  }>;
}

// ==================== KPI Types ====================

export interface KPI {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface KPIData {
  revenue: KPI;
  orders: KPI;
  users: KPI;
  conversionRate: KPI;
  averageOrderValue: KPI;
  customerLifetimeValue: KPI;
}

export interface RealTimeKPI {
  activeUsers: number;
  activeOrders: number;
  revenueToday: number;
  ordersToday: number;
  lastUpdate: string;
}

export interface KPITrend {
  date: string;
  value: number;
}

// ==================== Marketing Events Types ====================

export interface MarketingEvent {
  id: string;
  eventType: string;
  userId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EventsSummary {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySource: Record<string, number>;
  topCampaigns: Array<{
    campaign: string;
    events: number;
    conversions: number;
  }>;
}

// ==================== Funnel Types ====================

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
  dropOff: number;
}

export interface DropOffPoint {
  stage: string;
  dropOffRate: number;
  suggestions: string[];
}

// ==================== User Analytics Types ====================

export interface UserGrowth {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  growthRate: number;
}

export interface UserRetention {
  period: string;
  cohortSize: number;
  retained: number;
  retentionRate: number;
}

export interface CohortAnalysis {
  cohort: string;
  size: number;
  retention: Record<string, number>;
}

// ==================== Revenue Types ====================

export interface RevenueForecast {
  period: string;
  predicted: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  change: number;
}

// ==================== Advanced Analytics Types ====================

export interface DashboardOverview {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    averageOrderValue: number;
  };
  trends: {
    revenue: KPITrend[];
    orders: KPITrend[];
    users: KPITrend[];
  };
  topMetrics: KPI[];
}

export interface CohortAnalysisAdvanced {
  type: 'daily' | 'weekly' | 'monthly';
  cohorts: Array<{
    cohort: string;
    size: number;
    retention: Record<string, number>;
  }>;
}

export interface FunnelAnalysis {
  funnelType: string;
  stages: ConversionFunnel[];
  overallConversionRate: number;
}

export interface RetentionRate {
  period: string;
  rate: number;
  trend: KPITrend[];
}

export interface CustomerLTV {
  averageLTV: number;
  bySegment: Record<string, number>;
  trend: KPITrend[];
}

export interface ChurnRate {
  period: string;
  rate: number;
  churnedUsers: number;
  totalUsers: number;
  reasons: Record<string, number>;
}

export interface GeographicDistribution {
  metric: string;
  data: Array<{
    region: string;
    value: number;
    percentage: number;
  }>;
}

export interface PeakHours {
  hour: number;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  completionRate: number;
  averageRating: number;
  totalEarnings: number;
}

// ==================== Query Types ====================

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface PlatformQuery extends DateRangeQuery {
  platform?: string;
}

export interface PeriodQuery extends DateRangeQuery {
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface EventTypeQuery extends DateRangeQuery {
  eventType?: string;
}

export interface MetricQuery {
  metric: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface CohortQuery {
  cohortDate: string;
}

export interface FunnelTypeQuery {
  funnelType: string;
}

export interface GeoMetricQuery {
  metric?: string;
}

// ==================== Response Wrappers ====================

export interface AnalyticsResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

