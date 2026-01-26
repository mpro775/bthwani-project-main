/**
 * Analytics API - Index
 * تصدير جميع الـ hooks والـ functions
 */

// Export all hooks and functions
export * from './analytics-new';

// Export types
export type * from '@/types/analytics';

// Re-export commonly used hooks with shorter names
export {
  // ROAS
  useDailyRoas as useRoas,
  useRoasSummary,
  useRoasByPlatform,
  
  // KPIs
  useKPIs,
  useRealTimeKPIs as useRealtimeKPIs,
  useKPITrends,
  
  // Users
  useUserGrowth,
  useUserRetention,
  
  // Revenue
  useRevenueForecast,
  useRevenueBreakdown,
  
  // Advanced
  useCustomerLTV as useLTV,
  useChurnRate,
  useProductPerformance,
  useDriverPerformance,
} from './analytics-new';

