/**
 * Support API - vendor-app
 */

import { axiosInstance } from './axiosInstance';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: Array<{
    sender: string;
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export const createSupportTicket = async (data: {
  subject: string;
  description: string;
  category: string;
}): Promise<SupportTicket> => {
  const response = await axiosInstance.post('/support/tickets', data);
  return response.data;
};

export const getMySupportTickets = async (): Promise<SupportTicket[]> => {
  const response = await axiosInstance.get('/support/tickets');
  return response.data;
};

export const addMessageToTicket = async (id: string, message: string): Promise<SupportTicket> => {
  const response = await axiosInstance.patch(`/support/tickets/${id}/messages`, { message });
  return response.data;
};

