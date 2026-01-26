/**
 * Support System Types
 */

export interface SupportTicket {
  id: string;
  userId: string;
  userModel: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: TicketMessage[];
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  sender: string;
  senderModel: string;
  message: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'complaint';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  userModel?: string;
}

export interface AddMessageDto {
  message: string;
  isInternal?: boolean;
}

export interface RateTicketDto {
  rating: number;
  comment?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  averageResponseTime: number;
  averageResolutionTime: number;
}

export interface SupportResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

