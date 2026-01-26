/**
 * Support API - rider-app
 */

import { axiosInstance } from './axiosInstance';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: Array<{
    sender: string;
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const createSupportTicket = async (data: CreateTicketDto): Promise<SupportTicket> => {
  const response = await axiosInstance.post('/support/tickets', data);
  return response.data;
};

export const getMySupportTickets = async (): Promise<SupportTicket[]> => {
  const response = await axiosInstance.get('/support/tickets');
  return response.data;
};

export const getSupportTicketById = async (id: string): Promise<SupportTicket> => {
  const response = await axiosInstance.get(`/support/tickets/${id}`);
  return response.data;
};

export const addMessageToTicket = async (id: string, message: string): Promise<SupportTicket> => {
  const response = await axiosInstance.patch(`/support/tickets/${id}/messages`, { message });
  return response.data;
};

export const rateTicket = async (id: string, rating: number, comment?: string): Promise<SupportTicket> => {
  const response = await axiosInstance.patch(`/support/tickets/${id}/rate`, { rating, comment });
  return response.data;
};

