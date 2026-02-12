/**
 * Support API - vendor-app
 */

import axiosInstance from './axiosInstance';
import { unwrapResponse } from '../utils/apiHelpers';

export interface SupportTicket {
  _id?: string;
  id?: string;
  subject: string;
  description: string;
  category: 'technical' | 'payment' | 'account' | 'order' | 'general' | 'complaint' | 'feedback';
  status: string;
  messages?: {
    sender: string;
    message: string;
    timestamp?: string;
  }[];
  createdAt?: string;
}

export const createSupportTicket = async (data: {
  subject: string;
  description: string;
  category: string;
  priority?: string;
}): Promise<SupportTicket> => {
  const res = await axiosInstance.post('/support/tickets', {
    ...data,
    priority: data.priority || 'medium',
  });
  return unwrapResponse<SupportTicket>(res);
};

export const getMySupportTickets = async (): Promise<SupportTicket[]> => {
  const res = await axiosInstance.get('/support/tickets');
  const data = unwrapResponse<SupportTicket[]>(res);
  return Array.isArray(data) ? data : [];
};

export const addMessageToTicket = async (id: string, message: string): Promise<SupportTicket> => {
  const res = await axiosInstance.patch(`/support/tickets/${id}/messages`, { message });
  return unwrapResponse<SupportTicket>(res);
};

