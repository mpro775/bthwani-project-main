/**
 * Metrics API
 */

import { useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/metrics';

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) throw new Error(`Endpoint "${id}" not found`);
  return endpoint;
};

export function useJsonMetrics() {
  return useAdminQuery<Types.JsonMetrics>(
    getEndpoint('metrics-json'),
    {},
    { enabled: true }
  );
}

