/**
 * Support System API
 */

import { useAdminAPI, useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/support';

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) throw new Error(`Endpoint "${id}" not found`);
  return endpoint;
};

export function useSupportTickets(query?: {
  status?: string;
  category?: string;
  priority?: string;
}) {
  return useAdminQuery<Types.SupportResponse<Types.SupportTicket[]>>(
    getEndpoint('support-tickets-all'),
    { query },
    { enabled: true }
  );
}

export function useSupportTicket(id: string) {
  return useAdminQuery<Types.SupportResponse<Types.SupportTicket>>(
    getEndpoint('support-ticket-get'),
    { params: { id } },
    { enabled: !!id }
  );
}

export function useSupportStats() {
  return useAdminQuery<Types.SupportResponse<Types.TicketStats>>(
    getEndpoint('support-stats'),
    {},
    { enabled: true }
  );
}

export function useSupportAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    addMessage: async (id: string, data: Types.AddMessageDto) => {
      return callEndpoint(getEndpoint('support-ticket-add-message'), {
        params: { id },
        body: data
      });
    },
  };
}

