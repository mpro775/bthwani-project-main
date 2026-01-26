/**
 * Health Check API
 */

import { useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/health';

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) throw new Error(`Endpoint "${id}" not found`);
  return endpoint;
};

export function useHealthCheck() {
  return useAdminQuery<Types.HealthCheckResult>(
    getEndpoint('health-check'),
    {},
    { enabled: true }
  );
}

export function useHealthMetrics() {
  return useAdminQuery<Types.HealthMetrics>(
    getEndpoint('health-metrics'),
    {},
    { enabled: true }
  );
}

export function useDetailedHealth() {
  return useAdminQuery<Types.DetailedHealth>(
    getEndpoint('health-detailed'),
    {},
    { enabled: true }
  );
}

export function useAppInfo() {
  return useAdminQuery<Types.AppInfo>(
    getEndpoint('health-info'),
    {},
    { enabled: true }
  );
}

