/**
 * Support API - app-user
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

export interface AddMessageDto {
  message: string;
}

export interface RateTicketDto {
  rating: number;
  comment?: string;
}

// Create support ticket
export const createSupportTicket = async (data: CreateTicketDto): Promise<SupportTicket> => {
  const response = await axiosInstance.post('/support/tickets', data);
  return response.data;
};

// Get my support tickets
export const getMySupportTickets = async (): Promise<SupportTicket[]> => {
  const response = await axiosInstance.get('/support/tickets');
  return response.data;
};

// Get ticket by ID
export const getSupportTicketById = async (id: string): Promise<SupportTicket> => {
  const response = await axiosInstance.get(`/support/tickets/${id}`);
  return response.data;
};

// Add message to ticket
export const addMessageToTicket = async (id: string, data: AddMessageDto): Promise<SupportTicket> => {
  const response = await axiosInstance.patch(`/support/tickets/${id}/messages`, data);
  return response.data;
};

// Rate ticket
export const rateTicket = async (id: string, data: RateTicketDto): Promise<SupportTicket> => {
  const response = await axiosInstance.patch(`/support/tickets/${id}/rate`, data);
  return response.data;
};

// Get support stats
export const getSupportStats = async () => {
  const response = await axiosInstance.get('/support/stats');
  return response.data;
};

