/**
 * Legal System API
 */

import { useAdminAPI, useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/legal';

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) throw new Error(`Endpoint "${id}" not found`);
  return endpoint;
};

export function usePrivacyPolicies() {
  return useAdminQuery<Types.LegalResponse<Types.PrivacyPolicy[]>>(
    getEndpoint('legal-privacy-policies-all'),
    {},
    { enabled: true }
  );
}

export function useTermsOfService() {
  return useAdminQuery<Types.LegalResponse<Types.TermsOfService[]>>(
    getEndpoint('legal-terms-all'),
    {},
    { enabled: true }
  );
}

export function useConsentStatistics() {
  return useAdminQuery<Types.LegalResponse<Types.ConsentStatistics>>(
    getEndpoint('legal-consent-statistics'),
    {},
    { enabled: true }
  );
}

export function useLegalAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    createPrivacyPolicy: async (data: Types.CreatePrivacyPolicyDto) => {
      return callEndpoint(getEndpoint('legal-privacy-policy-create'), { body: data });
    },

    activatePrivacyPolicy: async (id: string) => {
      return callEndpoint(getEndpoint('legal-privacy-policy-activate'), { params: { id } });
    },

    createTermsOfService: async (data: Types.CreateTermsOfServiceDto) => {
      return callEndpoint(getEndpoint('legal-terms-create'), { body: data });
    },

    activateTermsOfService: async (id: string) => {
      return callEndpoint(getEndpoint('legal-terms-activate'), { params: { id } });
    },
  };
}

