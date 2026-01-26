/**
 * Admin API - Index
 * تصدير موحد لجميع الـ API modules
 */

// Marketers
export * from './marketers';

// Onboarding
export * from './onboarding';

// Finance
export * from './finance';

// Analytics
export * from './analytics';

// Akhdimni (أخدمني) ✅ NEW
export * from './akhdimni';

// Re-export hooks for convenience
export { useAdminAPI, useAdminQuery, useAdminMutation } from '@/hooks/useAdminAPI';
export { ALL_ADMIN_ENDPOINTS, ADMIN_ENDPOINTS_BY_MODULE, ENDPOINTS_STATS } from '@/config/admin-endpoints';
